var express = require('express');
var app = express();
var mongo = require('mongodb').MongoClient;
var client = require('socket.io').listen(3456).sockets;

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});



mongo.connect('mongodb://127.0.0.1/mongochat', function(error, db){
	if(error){
		throw error;
	}
	client.on('connection', function(socket){
		var chat = db.collection('chats');
		sendStatus = function(s){
			console.log('Status: ' + s);
			socket.emit('status', s);
		};

		chat.find().limit(100).sort({_id:1}).toArray(function(error, response){
			if(error){
				throw error;
			}
			socket.emit('output', response);
		});

		socket.on('input', function(data){
			var name = data.name;
			var message = data.message;

			if(name == '' || message == ''){
				sendStatus('Please fill in name and message');
			}
			else{
				chat.insert({name: name, message: message}, function(){
					socket.emit('output', [data]);
					sendStatus({
						message: 'Message Sent',
						clear: true
					});
				});
			}
		});

		socket.on('clear', function(data){
			chat.remove({}, function(){
				socket.emit('cleared');
			});
		});
	});
});

app.listen(3000);

console.log('Server is running on port: 3000');