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

	
});
