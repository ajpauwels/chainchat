var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var io = require('socket.io')();
var people = {};
app.io = io;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

io.on('connection', function(socket) {
  people[socket.id] = {}

  console.log('A user connected to the socket.io server');
  socket.on('username', function(username) {
    people[socket.id].name = username;
    people[socket.id].color = getRandomColor(); 
    socket.broadcast.emit('message', 'Server: ' + people[socket.id].name + ' has connected');
    console.log('User ID: ', people[socket.id].name);
    socket.emit('usermsg', 'Welcome ' + people[socket.id].name );
  });
  
  socket.on('disconnect', function() {
    console.log(people[socket.id].name + ' disconnected from the socket.io server');
      socket.emit('message','Server: ' + people[socket.id] + ' disconnected');
  });

  socket.on('message', function(msg) {
    people[socket.id].msg = ' ' + msg;
    console.log('New message from ' + people[socket.id].name +': ' + msg);
    io.emit('message', JSON.stringify(people[socket.id]));//TOOD
  });
});

function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;