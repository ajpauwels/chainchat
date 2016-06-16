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

//Cloudant and nano
var new_creds = {
                    host: 'fdc45491-fa13-4064-a77d-d433ae04a9ec-bluemix.cloudant.com',
                    port: "443",
                    username: 'itedifergaideredisseckst', //Key
                    password: '336c044aff82222a34828992bdbc830ff5a6bc5e',//API password

                };
nano = require('nano')('https://' + new_creds.username + ':' + new_creds.password + '@' + new_creds.host + ':' + new_creds.port);	//lets use api key to make the docs
db = nano.use("users"); 

// Routing files
var routes = require('./routes/index');
var users = require('./routes/users');

// Get the app running with socket.io
var app = express();
var io = require('socket.io')();
var people = {};
app.io = io;

// Process blockchain credentials based environment (Bluemix vs. local)
var creds = require('./creds').credentials;

// Setup and configure the hyperledger SDK
var hlc = require('hlc');
var chain = hlc.newChain("chainchat");
chain.setKeyValStore(hlc.newFileKeyValStore('./tmp/keyValStore'));

// Retrieve the CA credentials and set member services in the SDK - should only be one
var caCreds = null;
for (var key in creds.ca) {
  if (creds.ca.hasOwnProperty(key)) {
    caCreds = creds.ca[key];
  }
}
if (caCreds == null) {
  console.log("[ERROR] Unable to retrieve credentials for the member services");
} else {
  //chain.setMemberServicesUrl("grpc://%s:%s", caCreds.discovery_host, caCreds.discovery_port);
  chain.setMemberServicesUrl("grpc://ajp-ca.rtp.raleigh.ibm.com:50051");
}

//console.log("grpc://%s:%s", caCreds.discovery_host, caCreds.discovery_port);

// Retrieve and set the peers
// for (var i in creds.peers) {
//   var peer = creds.peers[i];
//   chain.addPeer("grpc://%s:%s", peer.discovery_host, peer.discovery_port);
//   console.log("grpc://%s:%s", peer.discovery_host, peer.discovery_port);
// }
chain.addPeer("grpc://ajp-p1.rtp.raleigh.ibm.com:30303");
chain.addPeer("grpc://ajp-p2.rtp.raleigh.ibm.com:30303");

// Set the chaincode's registrar
chain.enroll("test_user9", "H80SiB5ODKKQ", function(err, registrarUser) {
  if (err) {
    console.log(err);
    return console.log("[ERROR] Unable to enroll the registrar user: %s", err);
  }

  console.log("[SUCCESS] Enrolled the registrar user");

  chain.setRegistrar(registrarUser);
});


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
  socket.on('username', function(username) {
    people[socket.id].name = username;
    people[socket.id].color = getRandomColor(); 
    socket.broadcast.emit('usermsg', 'Server: ' + people[socket.id].name + ' has connected');
    console.log('User ID: ', people[socket.id].name);
    socket.emit('usermsg', 'Welcome ' + people[socket.id].name );
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

    // Check if there's a command
    var inputArr = msg.split(" ");
    switch (inputArr[0]) {
      // Register the user
      case "register":
        if (inputArr.length < 4) {
          console.log("[ERROR] Not enough arguments, expected 4 (command username account affiliation)");
          break;
        }
        var regReq = {
          enrollmentID: inputArr[1],
          account: inputArr[2],
          affiliation: inputArr[3]
        }

        chain.registerAndEnroll(regReq, function(err, user) {
          if (err) {
            console.log("[ERROR] Could not register user " + regReq.enrollmentID + ": " + err);
            return;
          }
        });
        break;

      default:
        console.log("[ERROR] Could not recognize given command");
        break;
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