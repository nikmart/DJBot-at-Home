/**
 * @Author: Nik Martelaro <nikmart>
 * @Date:   2017-12-11T18:40:02-05:00
 * @Email:  nmartelaro@gmail.com
 * @Filename: bot.js
 * @Last modified by:   nikmart
 * @Last modified time: 2018-02-23T14:48:40-05:00
 */



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

// song tracking
var lastSong;
//****************************************************************************//

//********************** MQTT MESSAGES WITH ACTIONS **************************//
// Setup the socket connection and listen for messages
client.on('connect', function () {
  client.subscribe('DJ0-say'); // messages from the wizard interface to speak out
  client.subscribe('DJ0-vol'); // control Spotify volume independent of system
  client.subscribe('DJ0-sys-vol'); // control system volume
  client.subscribe('DJ0-sys-note'); // wizard notes
  client.subscribe('DJ0-control-msg'); //genreal message from controller
  console.log("Waiting for messages...");

  // messages for testing
  client.publish('DJ0-heartbeat', 'alive');
  getSong();
});

// Print out the messages and say messages that are topic: "say"
// NOTE: These voices only work on macOS
client.on('message', function (topic, message) {
  // message is Buffer
  console.log(topic, message.toString());

  // Say the message using our function that turns Spotify down
  if (topic === 'DJ0-say') {
    say_message(message.toString());
  }

  // Control the spotify volume (without changing the system volume)
  if (topic === 'DJ0-vol') {
    spotify.setVolume(parseInt(message.toString()));
  }

  // Control the system volume (changes the music and the voice)
  if (topic === 'DJ0-sys-vol') {
    volume.set(parseInt(message.toString()));
  }

  // Get the song the first time that a user connects
  if (topic === 'DJ0-control-msg') {
    switch (message.toString()) {
      case 'getSong':
        spotify.getTrack(function(err, track){
          // send the song data to the control interface
          client.publish('DJ0-song', JSON.stringify(track));
        });
        break;
    }
  }


  //client.end();
});
//****************************************************************************//

// FUNCTIONS //
function say_message(msg) {
  //say.speak(msg);
  // Fire a callback once the text has completed being spoken
  say.speak(msg, null, null, (err) => {
    if (err) {
      return console.error(err)
    }
    console.log('Text has been spoken.')
    client.publish('DJ0-status', 'text-spoken')
  });
}

// Get the song info and update the song tracker lastSong
function getSong() {
  spotify.getTrack(function(err, track){
    // Check that the tack exists and isnt the last track [1]
    if ((typeof track !== 'undefined') && (track.id != lastSong)) {
      console.log(JSON.stringify(track));
      lastSong = track.id;
      // send the song data to the control interface
      client.publish('DJ0-song', JSON.stringify(track));
    }
  });
}

// Create a heartbeat
function heartbeat() {
  client.publish('DJ0-heartbeat', 'alive');
}

// Check for a new song
setInterval(getSong, 1000);

// Send a heartbeat to show that the bot is disconnected
setInterval(heartbeat, 5000);

// TESTS
//say_message("Hello, my name is D J bot! Let's listen to some music!")

// REFERENCES
// [1] https://stackoverflow.com/questions/13335873/how-can-i-check-whether-a-variable-is-defined-in-node-js
