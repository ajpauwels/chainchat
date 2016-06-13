// Express and dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// Routing
var routes = require('./routes/index');
var users = require('./routes/users');

// Get the app running with socket.io
var app = express();
var io = require('socket.io')();
app.io = io;

// Get our REST client
var Client = require('node-rest-client').Client;
var rest = new Client();

// Process credentials based environment (Bluemix vs. local)
var creds = require('./creds').credentials;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

io.on('connection', function(socket) {
  console.log('A user connected to the socket.io server');

  socket.on('disconnect', function() {
    console.log('A user disconnected from the socket.io server');
  })

  socket.on('message', function(msg) {
    console.log('New message: ' + msg);
    io.emit('message', msg);

    if (msg == 'bc') {
      var payload = {
        enrollId: creds.users[2].enrollId,
        enrollSecret: creds.users[2].enrollSecret
      };

      var args = {
        data: payload,
        headers: { "Content-Type": "application/json" }
      };


      rest.post(creds.peers[0].api_url + "/registrar", args, function(data, response) {
        console.log("Data:");
        console.log(data);
        console.log("\n");
        console.log("Response:");
        console.log(response);
      });
    }
  })
});

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
