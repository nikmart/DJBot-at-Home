/**
 * @Author: Nik Martelaro <nikmart>
 * @Date:   2017-12-11T18:40:02-05:00
 * @Email:  nmartelaro@gmail.com
 * @Filename: control.js
 * @Last modified by:   nikmart
 * @Last modified time: 2018-02-23T14:42:55-05:00
 */



/*
control.js - CONTOL INTERFACE

Author: Niklas Martelaro (nmartelaro@gmail.com)

Purpose: This is the server for the WoZ Way wizard station. The server acts as
the webserver for the control interface (which is an HTML page). The server also
manages MQTT messaging to and from DJ Bot. This is needed becasue there is not
a direct link from the web front-end to MQTT.

The server subscribes to MQTT messages from the car and publishes MQTT messages
that will the car will listen to.

Usage: node control.js

Notes: You will need to specify what MQTT server you would like to use.
*/

//****************************** SETUP ***************************************//
// Webserver for the cont rol interface front end
var express = require('express'); // web server application
var http = require('http');				// http basics
var app = express();							// instantiate express server
var server = http.Server(app);		// connects http library to server
var io = require('socket.io')(server);	// connect websocket library to server
var serverPort = 8080;

// MQTT messaging - specify the server you would like to use here
var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://hri.stanford.edu',
                           {port: 8134,
                            protocolId: 'MQIsdp',
                            protocolVersion: 3 });
//timesatamping
require('log-timestamp');
//****************************************************************************//

//****************************** WEB INTERFACE *******************************//
// use express to create the simple webapp
app.use(express.static('public'));		// find pages in public directory

// start the server and say what port it is on
server.listen(serverPort, function() {
    console.log('listening on *:%s', serverPort);
});
//****************************************************************************//

//********************** MQTT MESSAGES FROM BOT ******************************//
// Setup the MQTT connection and listen for messages
client.on('connect', function () {
  //Subscribe to topics
  client.subscribe('say');
  client.subscribe('DJ0-status');
  client.subscribe('DJ0-song');
  client.subscribe('DJ0-heartbeat');
  client.subscribe('DJ0-sys-note');
  console.log("Waiting for messages...");
  //client.publish('DJ0-say', 'Hello, I am a need finding machine');
});

// process the MQTT messages
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic, message.toString());

  // process the MQTT messages and send them to the client
  if (topic === 'DJ0-vol-state') {
    // update the volume display
    // pass the data along to the client
    console.log(topic, message.toString());
    io.emit('server-msg', message.toString());
  }

  if (topic === 'DJ0-status') {
    console.log(topic, message.toString());
    io.emit('server-msg', 'rampup')
  }

  if (topic === 'DJ0-song') {
    io.emit('song-msg', message.toString())
  }

  if (topic === 'DJ0-heartbeat') {
    io.emit('server-msg', message.toString())
  }

  if (topic === 'DJ0-sys-note') {
    io.emit('server-note', message.toString())
  }
  //client.end();
});
//****************************************************************************//

//*************** WEBSOCKET MESSAGES FROM CONTROL INTERFACE ******************//
// This is the websocket event handler. WebSockets are used to communicate
// between this server and the webapp front end wizard interface.
// As long as someone is connected, listen for messages from the wizard
// interface.
io.on('connect', function(socket) {
    console.log('a user connected');
    client.publish('DJ0-control-msg', 'getSong');

    // if you get a message to send, send to the MQTT broker
    socket.on('msg', function(msg) {
        console.log(msg);
        //send it to the mqtt broker
        client.publish('DJ0-say', msg);
    });

    // if you get a volume change message send it to the bot
    socket.on('spotify-vol', function(msg) {
      console.log(msg);
      // send if to the mqtt broker
      client.publish('DJ0-vol', msg);
    });

    // if you get a system volume change message send it to the bot
    socket.on('sys-vol', function(msg) {
      console.log(msg);
      // send if to the mqtt broker
      client.publish('DJ0-sys-vol', msg);
    });

    // if you get a note, send it to the server
    socket.on('sys-note', function(msg) {
      console.log(msg);
      // send if to the mqtt broker
      client.publish('DJ0-sys-note', msg);
    });

    // if you get the 'disconnect' message, say the user disconnected
    socket.on('disconnect', function() {
        console.log('user disconnected');
    });
});
//****************************************************************************//
