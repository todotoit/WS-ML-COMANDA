var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var debounceTime = 5 // millis
var debouncing = false

function dataHandler(msglabel, data) {
  console.log(msglabel, data)
  if (debouncing) return
  debouncing = true
  setTimeout(() => { debouncing = false }, debounceTime)
  io.emit(msglabel, data)
}

app.get('/', function(req, res){
  console.log('hello')
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
  });
  socket.on('pose', (data) => {
    if (data == '') return
    dataHandler('poseCmd', data)
  })
  socket.on('audio', (data) => {
    if (data == 0) return
    dataHandler('audioCmd', data)
  })
});

http.listen(3004, function(){
  console.log('listening on *:3004');
});