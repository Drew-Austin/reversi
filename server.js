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
			

var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
	function log(){
		var array = ['*** Server log message: '];
		for(var i = 0; i < arguments.length; i++){
			array.push(arguments[i]);
			console.log(arguments[i]);
	
		}
		socket.emit('log', array);
		socket.broadcast.emit('log', array);
	}

	log('A website connected to the server');

	socket.on('disconnect', function(socket){ 
                log('A website disconnected from the server');
        });
	

	 socket.on('join_room', function(payload){
                log('Server recieved a command','join_room',payload);
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

		socket.join(room);
		var roomObject = io.sockets.adapter.rooms[room];
                 if(('undefined' === typeof roomObject) || !roomObject){
                 var error_message = 'join_room could not create room,,  command abort';
                 log(error_message);
                 socket.emit('join_room_response', {
                                      Result: 'fail',
                                                message: error_message
                        });
                return;
                }
		
		var numClients = roomObject.length;
		var success_data = {
					result: 'success',
					room: room,
					username: username,
					membership: (numClients + 1)
				};
		io.sockets.in(room).emit('join_room_response',success_data); 
		log('Room' + room + 'was just joined by ' + username);
		


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
