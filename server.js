/* include the static web server library */

var static = require('node-static');

/* include http server libray */

var http = require('http');

/* assume we are running on heroku */

var port = process.env.PORT;
var directory = __dirname + '/public';


/* if we aren't on heroku then we need to readjust the port*/

if(typeof port == 'undefined' || !port){
	directory = './public';
	port = 8080;
}

/* set up static web server */

var file = new static.Server(directory);

/* constuct an http server that gets file from the server */

var app = http.createServer(
	function(request,response){
		request.addListener('end',
			function(){
				file.serve(request,response);
			}
		).resume();
	}
	).listen(port);
console.log('Server is running');
			



var players =[];

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {

	log('Client connection by'+socket.id);	

	function log(){
		var array = ['*** Server log message: '];
		for(var i = 0; i < arguments.length; i++){
			array.push(arguments[i]);
			console.log(arguments[i]);
	
		}
		socket.emit('log', array);
		socket.broadcast.emit('log', array);
	}

	
	

	 socket.on('join_room', function(payload){

                log('\'Join_room\'  command'+JSON.stringify(payload));

		 if(('undefined' === typeof payload) || !payload){
			var error_message = 'join_room had no payload, command abort';
			log(error_message);
			socket.emit('join_room_response', {
						Result: 'fail',
						message: error_message
			});
		return;
		}


	
		 var room = payload.room;
	         if(('undefined' === typeof room) || !room){
        	 var error_message = 'join_room didn\'t ,specify a room,  command abort';
        	 log(error_message);
        	 socket.emit('join_room_response', { 
                                      Result: 'fail',
                                                message: error_message
                        });
                return;
                }


		 var username = payload.username;
                 if(('undefined' === typeof username) || !username){
                 var error_message = 'join_room didn\'t ,specify a username,  command abort';
                 log(error_message);
                 socket.emit('join_room_response', {
                                      Result: 'fail',
                                                message: error_message
                        });
                return;
                }
		
		
		players[socket.id] = {};
		players[socket.id].username = username;
		players[socket.id].room = room;


		socket.join(room);


		var roomObject = io.sockets.adapter.rooms[room];
		var numClients = roomObject.length;
		var success_data = {
					result: 'success',
					room: room,
					username: username,
					socket_id: socket.id,
					membership: numClients
				};
		io.in(room).emit('join_room_response',success_data);

		for(var socket_in_room in roomObject.sockets){
			 var success_data = {
                                        result: 'success',
                                        room: room,
                                        username: players[socket_in_room].username,
                                        socket_id: socket_in_room,
                                        membership: numClients     
                                };
			 socket.emit('join_room_response',success_data);
				}
			log('join_room success');
			
		 
		
		 socket.on('disconnect', function(){
                log('Client disconnected'+JSON.stringify(players[socket.id]));

		if('undefined' !== typeof players[socket.id] && players[socket.id]){
			var username = players[socket.id].username;
			var room = players[socket.id].room;
			var payload = {

					username: username,
					socket_id: socket.id
				      };
			delete  players[socket.id];
			io.in(room).emit('player_disconnected',payload);
			}

		
        });

/* newwwwwwwwww commmmmmmmmmeeeeeennnnnnttttttt */

		socket.on('send_message', function(payload){
                log('Server recieved a command','send_message',payload);
                 if(('undefined' === typeof payload) || !payload){
                        var error_message = 'send_message had no payload, command abort';
                        log(error_message);
                        socket.emit('send_message_response', {
                                                Result: 'fail',
                                                message: error_message
                        });
                return;
                }



                 var room = payload.room;
                 if(('undefined' === typeof room) || !room){
                 var error_message = 'send_message didn\'t ,specify a room,  command abort';
                 log(error_message);
                 socket.emit('send_message_response', {
                                      Result: 'fail',
                                                message: error_message
                        });
                return;
                }


                 var username = payload.username;
                 if(('undefined' === typeof username) || !username){
                 var error_message = 'send_message didn\'t ,specify a username,  command abort';
                 log(error_message);
                 socket.emit('send_message_response', {
                                      Result: 'fail',
                                                message: error_message
                        });
                return;
                }
		

		    var message  = payload.message;
                 if(('undefined' === typeof message) || !message){
                 var error_message = 'send_message didn\'t ,specify a message,  command abort';
                 log(error_message);
                 socket.emit('send_message_response', {
                                      Result: 'fail',
                                                message: error_message
                        });
                return;
                }
		
		var success_data = {
					result: 'success',
					room: room,
					username: username,
					message: message
					};
				io.sockets.in(room).emit('send_message_response',success_data);
				log('Message sent to room ' + room + 'by ' + username);
			});


	
        });
	
	

});
