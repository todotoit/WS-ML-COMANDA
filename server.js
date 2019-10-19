var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var debounceTime = 20 // millis
var debouncing = false

var debounceSound = 15
var countSound = 0
var currentSound = null

function dataHandler(msglabel, data) {
  //console.log(msglabel, data)
  if (debouncing) return
  debouncing = true
  setTimeout(() => { debouncing = false }, debounceTime)
  io.emit(msglabel, data)
}

function audioHandler(msglabel, data) {
  //console.log(msglabel, data)
  if(currentSound !== data) {
    currentSound = data
    countSound = 0
    return
  } else countSound++
  if (countSound < debounceSound) return
  console.log(data)
  countSound = 0
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
    audioHandler('audioCmd', data)
  })
});

http.listen(3004, function(){
  console.log('listening on *:3004');
});