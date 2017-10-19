/*
bot.js - DJ Bot bot code

Author: Niklas Martelaro (nmartelaro@gmail.com)

Purpose: This is the server for the in-home DJ Bot. It accepts messages from the
control interface for the bot to speak. It also controls the volume of the
system.

The server subscribes to MQTT messages from the control interfcae and publishes
MQTT messages that will the control interface will listen to.

Usage: node bot.js

Notes: You will need to specify what MQTT server you would like to use.
*/

//****************************** SETUP ***************************************//
// MQTT Setup
var mqtt   = require('mqtt');
var client = mqtt.connect('mqtt://hri.stanford.edu',
                           {port: 8134,
                            protocolId: 'MQIsdp',
                            protocolVersion: 3 });
// Text to speech setup
var say = require('say');

// Spotify Controls
var spotify = require('spotify-node-applescript');

//System Volume control
var volume = require('osx-volume-controls')

//timesatamping
require('log-timestamp');
//****************************************************************************//

//********************** MQTT MESSAGES WITH ACTIONS **************************//
// Setup the socket connection and listen for messages
client.on('connect', function () {
  client.subscribe('DJ0-say'); // messages from the wizard interface to speak out
  client.subscribe('DJ0-vol'); // control Spotify volume independent of system
  client.subscribe('DJ0-sys-vol'); // control system volume
  console.log("Waiting for messages...");

  // messages for testing
  client.publish('DJ0-say', 'Hello, my name is DJ bot!');
});

// Print out the messages and say messages that are topic: "say"
// NOTE: These voices only work on macOS
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic, message.toString());

  // Say the message using our function that turns Spotify down
  if (topic === 'DJ0-say') {
    say_message(message.toString())
  }

  // Control the spotify volume (without changing the system volume)
  if (topic === 'DJ0-vol') {
    spotify.setVolume(parseInt(message.toString()));
  }

  // Control the system volume (changes the music and the voice)
  if (topic === 'DJ0-sys-vol') {
    volume.set(parseInt(message.toString()));
  }

  //client.end();
});
//****************************************************************************//

// FUNCTIONS //
function say_message(msg) {
  say.speak(msg);
  // Turn the volume down, say something, then turn it back up to the original
  // volume. The functions are stacked since they are based on callbacks and
  // usualy run asynchronously
  // spotify.getState(function(err, state) {
  //   level = state.volume;
  //   console.log(level);
  //   // Lower the Spotify volume by 50%
  //   spotify.setVolume(level/2, function() {
  //     // Say the message
  //     say.speak(msg, 'Samantha', 1.0, (err) => {
  //       if (err) {
  //         return console.error(err);
  //       }
  //       // Set the volume back to the original level
  //       spotify.setVolume(level);
  //     });
  //   });
  // });
}

// TESTS
//say_message("Hello, my name is D J bot! Let's listen to some music!")
