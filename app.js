var express = require('express');
var logger = require('morgan');
var fs = require('fs');

var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(logger('dev'));
app.use(express.static('public'));
app.set('view engine', 'jade');

var current_video = {
  type: 'video/mp4'
};

function new_video() {
  fs.readdir('public/uploads', function(err, items) {
    var n = Math.round(Math.random()*items.length)-1;
    console.log("Playing gif", items[n]);
    current_video.src = 'uploads/' + items[n];
    io.emit('play', current_video);
  });
}

app.get('/', function (req, res) {
  res.render('index');
});

app.get('/app', function (req, res) {
  res.render('app');
});

io.on('connection', function (socket) {
  console.log("Connection from", socket.id);
  socket.emit('play', current_video);
});

server.listen(3000, new_video);
setInterval(new_video, 60*1000);
