var express = require('express'), 
    app = express(),
    http = require('http'),
    socketIo = require('socket.io');

// start webserver on port 8080
var server =  http.createServer(app);
var io = socketIo.listen(server);
var __dirname = 'C:/Users/Bubbles/programming/nodejs/tutorials/drawingapp'
server.listen(8080);
// add directory with our static files
app.use(express.static(__dirname + '/public'));
console.log("Server running on 127.0.0.1:8080");

// array of all lines drawn
var line_history = [];

//array for all messages sent
var message_history = [];

//array for all connected users
var connected_users = [];
var client_sockets = [];

// event-handler for new incoming connections
io.on('connection', function (socket) {

    socket.emit('set username', "user " + String(connected_users.length));
    connected_users.push("user " + String(connected_users.length));
    client_sockets.push(socket);
    io.emit('update users', connected_users);

   // first send the history to the new client
   for (var i in line_history) {
      socket.emit('draw_pencil', { line: line_history[i] } );
   }
   
   for (var i in message_history){
       socket.emit('chat message', {message : message_history[i]});
   }

   // add handler for message type "draw_pencil".
   socket.on('draw_pencil', function (data) {
      // add received line to history 
      line_history.push(data.line);
      // send line to all clients
      io.emit('draw_pencil', { line: data.line });
   });
   
   //handler for chat messages
   socket.on('chat message', function(data){
      io.emit('chat message', { message: data.message});
	  message_history.push(data.message);
   });

   socket.on('disconnect', function () {
       var pos = client_sockets.indexOf(socket);
       client_sockets.splice(i, 1);
       connected_users.splice(i, 1);
       io.emit('update users', connected_users);
   });

   
   
});