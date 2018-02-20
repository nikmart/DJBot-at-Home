/**
 * @Author: Nik Martelaro <nikmart>
 * @Date:   2017-12-11T18:40:02-05:00
 * @Email:  nmartelaro@gmail.com
 * @Filename: client.js
 * @Last modified by:   nikmart
 * @Last modified time: 2018-02-20T11:00:13-05:00
 */



// JavaScript Document
var socket = io();
var spotifyVol = "100";
var restore = false;
var queueCount = 0;

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

function sendMsg() {
    // lower the volume first
    if (!restore) {
      halfSpotify();
    }
    // get and send the messge to the remote interface
    var msg = document.getElementById("message").value;
    console.log(msg);
    socket.emit('msg', msg); //send the message to ther server

    // add the question to the list
    addQuestion(msg);

    // reset the message window
    resetMsg();
}

function queueMsg() {
    // get and send the messge to the remote interface
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
    console.log(msg);
    socket.emit('sys-note', msg); //send the message to ther server
    addNote(msg);
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
    changeSpotifyVol((current_vol/2).toString());
    range.value = (current_vol/2).toString();
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
      current_vol++;
      changeSpotifyVol(current_vol.toString());
      range.value = current_vol.toString();
      rampVolUp(current_vol);
    }, 25);
  }
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
    }
});
