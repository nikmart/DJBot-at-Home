// JavaScript Document
var socket = io();
var spotifyVol = "100";
var restore = false;
var queueCount = 0;
var track;
var botStatus = '';
var heartbeatTimer;
var wizardName = '';


// send out sound message over socket
function play(id) {
    socket.emit('play', id);
}

function sendOnEnter() {
    // send on enter key
    if (event.keyCode == 13) {
        sendMsg();
    }
}

function queueOnEnter() {
    // send on enter key
    if (event.keyCode == 13) {
        queueMsg();
    }
}

function setName() {
  if (event.keyCode == 13) {
    wizardName = document.getElementById('name').value;
    document.getElementById('name').readOnly = true;
    document.getElementById('name').style.border = "none";
  }
}

function sendMsg() {
    // lower the volume first
    if (!restore) {
      halfSpotify();
    }
    setTimeout(delayedMsg, 1000); 
}


function delayedMsg(){
  // get and send the message to the remote interface
  var msg = document.getElementById("message").value;
  msg = parseSong(msg); //check for any song keywords
  console.log(msg);
  socket.emit('msg', msg); //send the message to ther server

  // add the question to the list
  addQuestion(msg);

  // reset the message window
  resetMsg();
}





function queueMsg() {
    // get and send the message to the remote interface
    var msg = document.getElementById("queue_message").value;
    console.log(msg);
    //socket.emit('msg', msg); //send the message to ther server

    // add the question to the list
    queueQuestion(msg);

    // reset the message window
    resetQueue();
}

function sendNote() {
  // only send the note if it is an ENTER key
  if (event.keyCode == 13) {
    // get and send the messge to the remote interface
    if(event.preventDefault) event.preventDefault();
    var msg = document.getElementById("note").value;
    console.log(wizardName + ': ' + msg);
    socket.emit('sys-note', wizardName + ': ' + msg); //send the message to ther server
    addNote(wizardName + ': ' + msg);
    document.getElementById("note").value = ''; //reset note window
  }
}

function resetMsg() {
    document.getElementById("message").value = '';
}

function resetQueue() {
    document.getElementById("queue_message").value = '';
}

function addQuestion(msg) {
    // create a new line with the questions at the top of the list
    msg = parseSong(msg);
    var para = document.createElement("p");
    var node = document.createTextNode(msg);
    para.appendChild(node);

    var btn = document.createElement("BUTTON");
    btn.className = "play";
    var btnReplay = document.createTextNode("\u25B6"); // Create a text node
    btn.onclick = function() {
        replayMsg(msg);
    };
    btn.appendChild(btnReplay);

    para.prepend(btn);
    para.className = "previous-question";
    var element = document.getElementById("questions");
    element.prepend(para);
}

function queueQuestion(msg) {
    // create a new line with the questions at the top of the list
    var para = document.createElement("p");
    var node = document.createTextNode(msg);
    para.appendChild(node);
    para.id = "queue" + queueCount;
    msgID = para.id;
    queueCount++;

    var btn = document.createElement("BUTTON");
    btn.className = "play";
    var btnReplay = document.createTextNode("\u25B6"); // Create a text node
    btn.onclick = function() {
      msg = parseSong(msg);
      replayMsg(msg);
      addQuestion(msg);
      clearQuestion(this.parentNode.id); //[https://stackoverflow.com/questions/27842138/get-id-of-parent-element-on-click]
    };
    btn.appendChild(btnReplay);

    para.prepend(btn);
    para.className = "previous-question";
    var element = document.getElementById("queued_questions");
    element.prepend(para);
}

function addNote(msg) {
    // create a new line with the questions at the top of the list
    var para = document.createElement("p");
    var node = document.createTextNode(msg);
    para.appendChild(node);

    para.className = "previous-note";
    var element = document.getElementById("notes");
    element.prepend(para);
}

function replayMsg(msg) {
    console.log(msg);
    if (!restore) {
      halfSpotify();
    } //lower the volume first
    socket.emit('msg', msg); //send the message to ther server
}

function playMsg(msgID) {
    //lower the volume first
    if (!restore) {
      halfSpotify();
    }
    var msg = document.getElementById(msgID).innerHTML;
    console.log(msg);
    msg = parseSong(msg);
    socket.emit('msg', msg); //send the message to ther server
    addQuestion(msg);
}

//Clear a message from the queue
//[https://www.w3schools.com/js/js_htmldom_nodes.asp]
function clearQuestion(msgID) {
  var parent = document.getElementById('queued_questions');
  var queue_message = document.getElementById(msgID);
  parent.removeChild(queue_message);
}

function readEnglish() {
    lang = 'english';
    socket.emit('lang', lang);
}

function readFrench() {
    lang = 'french';
    socket.emit('lang', lang);
}

function readJapanese() {
    lang = 'japanese'
    socket.emit('lang', lang);
}

function changeSpotifyVol(newValue)
{
	document.getElementById("spotify-vol").innerHTML=newValue;
  socket.emit('spotify-vol', newValue)
}

function changeSysVol(newValue)
{
	document.getElementById("sys-vol").innerHTML=newValue;
  socket.emit('sys-vol', newValue)
}

function halfSpotify() {
  current_vol = parseInt(document.getElementById("spotify-vol").textContent);
  console.log(current_vol);
  if (!restore) {
    spotifyVol = current_vol; //update the last volume
    range = document.getElementById("spotifyRange")
    changeSpotifyVol((current_vol/4).toString());
    range.value = (current_vol/4).toString();
    document.getElementById("spotifyHalf").textContent = "RESTORE";
    restore = true;
  } else {
    range = document.getElementById("spotifyRange");
    //changeSpotifyVol(spotifyVol.toString());
    rampVolUp(current_vol);
    document.getElementById("spotifyHalf").textContent = "HALF";
    restore = false;
  }
}

function rampVolUp(current_vol) {
  if (current_vol < spotifyVol) {
    setTimeout(function(){
      current_vol+=5;
      changeSpotifyVol(current_vol.toString());
      range.value = current_vol.toString();
      rampVolUp(current_vol);
    }, 100);
  }
}

function parseSong(message) {
  parsedMessage = message;
  //check for song info keywords $artist, $track, $song, $album
  parsedMessage = parsedMessage.replace('$artist', track.artist);
  parsedMessage = parsedMessage.replace('$band', track.artist);
  parsedMessage = parsedMessage.replace('$track', track.name);
  parsedMessage = parsedMessage.replace('$song', track.name);
  parsedMessage = parsedMessage.replace('$album', track.album);

  parsedMessage = parsedMessage.replace('#artist', track.artist);
  parsedMessage = parsedMessage.replace('#band', track.artist);
  parsedMessage = parsedMessage.replace('#track', track.name);
  parsedMessage = parsedMessage.replace('#song', track.name);
  parsedMessage = parsedMessage.replace('#album', track.album);

  console.log(parsedMessage);
  return parsedMessage;
}

// read the data from the message that the server sent and change the
// background of the webpage based on the data in the message
socket.on('server-msg', function(msg) {
    console.log('msg:', msg);
    switch(msg) {
        case 'rampup':
            current_vol = parseInt(document.getElementById("spotify-vol").textContent);
            rampVolUp(current_vol);
            restore = false;
            break;
        // heartbeat message
        case 'alive':
          clearTimeout(heartbeatTimer);
          if (botStatus != 'alive') {
            document.getElementById("namestatus").textContent = "DJ Bot 0 - Connected";
            document.getElementById("namestatus").style.color = '#1DB954';
            botStatus = 'alive';
          }
          heartbeatTimer = setTimeout(function(){
            botStatus = '';
            console.log("reset heartbeat");
            document.getElementById("namestatus").textContent = "DJ Bot 0 - Offline";
            document.getElementById("namestatus").style.color = "red";
          }, 7000);
          break;
    }
});

//get the song info and update the song display
socket.on('song-msg', function(msg) {
    console.log('msg:', msg);
    track = JSON.parse(msg);
    document.getElementById("song").textContent = track.name +
                                                  ', ' +
                                                  track.artist +
                                                  ', ' +
                                                  track.album;
});

//get notes from other wizards
socket.on('server-note', function(msg){
  //only print notes from other wizards
  //https://stackoverflow.com/questions/6614424/check-if-text-is-in-a-string
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/indexOf
  if (msg.indexOf(wizardName + ':') == -1) {
    addNote(msg);
  }
})

var acc = document.getElementsByClassName("accordion");
var i;

for (i = 0; i < acc.length; i++) {
  acc[i].addEventListener("click", function() {
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    if (panel.style.display === "block") {
      panel.style.display = "none";
    } else {
      panel.style.display = "block";
    }
  });
}
