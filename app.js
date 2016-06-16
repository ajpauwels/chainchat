/**
 * This app runs the ChainChat messaging client, an IBM Blockchain-powered high-security,
 * decentralized instant-messenger.
 * 
 * Contributors:
 *  - Alexandre Pauwels
 *  - Jack Sartore
 *  - Sid Ramesh
 * 
 * Last updated: 06/14/2016
 */

// Express and dependencies
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var color1 = '';

//Cloudant and nano
var new_creds = {
                    host: 'fdc45491-fa13-4064-a77d-d433ae04a9ec-bluemix.cloudant.com',
                    port: "443",
                    username: 'itedifergaideredisseckst', //Key
                    password: '336c044aff82222a34828992bdbc830ff5a6bc5e',//API password

                };
nano = require('nano')('https://' + new_creds.username + ':' + new_creds.password + '@' + new_creds.host + ':' + new_creds.port);	//lets use api key to make the docs
db = nano.use("users"); 

/* OLD DO NOT USE
var Cloudant = require('cloudant');
var ckey = 'itedifergaideredisseckst';
var cpass = '336c044aff82222a34828992bdbc830ff5a6bc5e';
var cloudant = Cloudant({acount: "cc", key: ckey, password: cpass});*/

//var db = cloudant.db.user('users');


// Routing files
var routes = require('./routes/index');
var users = require('./routes/users');

// Get the app running with socket.io
var app = express();
var io = require('socket.io')();
var people = {};
app.io = io;

// Get our REST client
var Client = require('node-rest-client').Client;
var rest = new Client();

// Process blockchain credentials based environment (Bluemix vs. local)
var creds = require('./creds').credentials;

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set favicon, logger, parsers, and the static assets directory
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Set up routes
app.use('/', routes);
app.use('/users', users);

// When a user connects through sockets add him to the array and set up bindings
io.on('connection', function(socket) {
  people[socket.id] = {}

  console.log('A user connected to the socket.io server');

  // Set the username when received from client
  socket.on('username', function(jusername) {
    console.log(jusername);
    var user = JSON.parse(jusername); //The user locally
    get_user(user.username, function(err, user_doc){
      var duser = user_doc; //The user from the database
      
      if( err != null ) { //User doesn't exists, create new
        console.log("user does not exists!");
        //Create user
        duser._id = user.username;
        duser.name = user.username;
        duser.color = getRandomColor();
        duser.password = user.password;
        duser.online = true;

        console.log(duser);

        create_user(duser, function(err, user_doc){});
        socket.emit('usermsg', 'Welcome ' + people[socket.id].name );
      } else if(duser.password != user.password) {  //if user exists & bad password
        console.log('DB user: ' + duser);
        console.log('wrong password');
        var jsonuser = JSON.stringify(user);
        socket.emit('password', jsonuser);
      } else {
        socket.emit('usermsg', 'Welcome ' + people[socket.id].name );

      }
      people[socket.id].color = duser.color; 

    });

    people[socket.id].name = user.username;
    socket.broadcast.emit('usermsg', 'Server: ' + people[socket.id].name + ' has connected');
    console.log(' local User: ', people[socket.id]);
  });
  
  // Log when a user disconects
  socket.on('disconnect', function() {
    console.log(people[socket.id].name + ' disconnected from the socket.io server');
    socket.broadcast.emit('usermsg','Server: ' + people[socket.id].name + ' disconnected');
  });

  // When a message is received, emit it to everyone
  socket.on('message', function(msg) {
    people[socket.id].msg = ' ' + msg;
    console.log('New message from ' + people[socket.id].name +': ' + msg);
    io.emit('message', JSON.stringify(people[socket.id]));

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
  });
});

/**
 * Generates a random hex-value color
 * 
 * @return The color as a hex-value string
 */
function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

//get a user from the database by username
function get_user(username, cb) { // username is a string
  db.get(username, {}, function(err, body){
    if(cb){
      if(!err && body) cb(null, body);
      else if(err && err.statusCode) cb(err.statusCode, {error: err.error, reason: err.reaosn});
      else cb(500, {error: err, reason: 'unknown!'});
    }
  });
}

function create_user(user, cb) { // user is a json object
  db.insert(user, function(err, body){
    if(cb){
      if(!err && body){
        user._rev = body.rev;
        cb(null, user);
      }
      else if(err && err.statusCode) cb(err.statusCode, {error: err.error, reason: err.reason});
      else cb(500, {error: err, reason: 'unknown!' });
    }
  });
}
// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers

// Development error handler will print stack trace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler does not leak stacktraces to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;