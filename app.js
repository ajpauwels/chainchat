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

// console.log("grpc://%s:%s", caCreds.discovery_host, caCreds.discovery_port);

// Retrieve and set the peers
for (var i in creds.peers) {
  var peer = creds.peers[i];
  // chain.addPeer("grpc://%s:%s", peer.discovery_host, peer.discovery_port);
  // console.log("grpc://%s:%s", peer.discovery_host, peer.discovery_port);
}
chain.addPeer("grpc://ajp-p1.rtp.raleigh.ibm.com:30303");
chain.addPeer("grpc://ajp-p2.rtp.raleigh.ibm.com:30303");

// Set the chaincode's registrar
chain.enroll("ajp", "trainisland", function(err, registrarUser) {
  if (err) {
    console.log(err);
    return console.log("[ERROR] Unable to enroll the registrar user: %s", err);
  }
  chain.setRegistrar(registrarUser);
  console.log("[SUCCESS] Enrolled the registrar user: %s", registrarUser);

  // Deploy the chaincode
  var deployReq = {
    args: ["test", "test2"],
    chaincodeID: "chainchat",
    fcn: "Init",
    chaincodePath: "github.com/ajpauwels/learn-chaincode"
  };

  var deployTx = registrarUser.deploy(deployReq);

  // Store chaincode ID on successful deploy
  deployTx.on('complete', function(results) {
    console.log("[SUCCESS] Deployed chaincode (ID: %s): %j", results.chaincodeID, results);
    chain.chaincodeID = results.chaincodeID;
  });

  // Report deployment error
  deployTx.on('error', function(err) {
    console.log("[ERROR] Failed to deploy chaincode: %j", err);
  });
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
          affiliation: inputArr[3],
          registrar: {
            roles: ["client"],
            delegateRoles: ["client"]
          }
        }

        chain.register(regReq, function(err, user) {
          if (err) {
            console.log("[ERROR] Could not register user " + regReq.enrollmentID + ": " + err);
            return;
          }
          console.log("[SUCCES] Registered user " + regReq.enrollmentID);
        });
        break;

      default:
        var invokeReq = {
          chaincodeID: chain.chaincodeID,
          fcn: "write",
          args: ["cunt", "muffin"],
        };
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