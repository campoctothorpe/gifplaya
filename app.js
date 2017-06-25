var express = require('express');
var logger = require('morgan');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(logger('dev'));
app.use(express.static('public'));
app.set('view engine', 'jade');


app.get('/', function (req, res) {
  res.render('index');
});

app.get('/app', function (req, res) {
  res.render('app');
});

function tick() {
  io.emit('play', {
    src: "/uploads/5CCzA0x.mp4",
    type: 'video/mp4'
  });
}

io.on('connection', function (socket) {
  console.log("Connection from", socket.id);
  socket.emit('play', {
    src: "/uploads/e47sLR5dUmALfcNxiYLlsa7ZS2h14ZvGxj6rPfo3ng4.mp4",
    type: 'video/mp4'
  });
});

server.listen(3000, function() {
  setInterval(tick, 10000);
});
