// JavaScript Document
var socket = io();
var spotifyVol = "100";
var restore = false;

// send out sound message over socket
function play(id) {
    socket.emit('play', id);
}

function sendOnEnter() {
    // send on enter key
    if (event.keyCode == 13) {
        halfSpotify();
        sendMsg();
    }
}

function sendMsg() {
    // get and send the messge to the remote interface
    var msg = document.getElementById("message").value;
    console.log(msg);
    socket.emit('msg', msg); //send the message to ther server

    // add the question to the list
    addQuestion(msg);

    // reset the message window
    resetMsg();
}

function resetMsg() {
    document.getElementById("message").value = '';
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
        replayMsg(msg)
    };
    btn.appendChild(btnReplay);

    para.prepend(btn);
    para.className = "previous-question";
    var element = document.getElementById("questions");
    element.prepend(para);
}

function replayMsg(msg) {
    console.log(msg);
    socket.emit('msg', msg); //send the message to ther server
}

function playMsg(msgID) {
    var msg = document.getElementById(msgID).innerHTML;
    console.log(msg);
    socket.emit('msg', msg); //send the message to ther server
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
