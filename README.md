# DJBot-at-Home
This project contains all the code to run DJ Bot, a Wizard of Oz controlled Spotify radio and speech agent. This work is part of Nik Martelaro's thesis, "The Needfinding Machine." There are two components to the system, the BOT and the CONTROL. The BOT is the in-home radio with speech agent. The CONTROL interface provides the a tool for remote designers and researchers to control the vocie of DJ Bot and to takes notes on the interaction.

### BOT
The BOT directory contains the souce code for the in-context DJ Bot. The Bot used the Spotify desktop app and the Apple Text-to-Speech system to control music and speak messages. DJ Bot also steams a live video/audio feed over web chat (unsing Hangouts or Skype),

#### Requirements
1. MacOS
2. Installed Apple voices - whichever voices and languages you would like. I recommend the high quality versions.
3. NodeJS and NPM
4. Spotify Desktop
5. Speakers
6. Webcam with microphone
7. [forever.js](https://github.com/foreverjs/forever) (a system to keep node apps running in the background)

#### Instructions
1. Clone this repo using git
2. Navigate to `BOT` directory using your Terminal
3. Run `npm install`
4. Run `forever start bot.js -l out.log -e err.log`


### CONTROL
The CONTROL directory contains the source code for running the DJ Bot control page. It is a NodeJS based web application that allows for the remote wizard to control the speech of the DJ Bot and the music volume. There are three areas to on the interface.

1. A section to write custom messages that are sent to the DJ Bot and spoken out loud.
2. A section with pre-defined messages and quick play buttons.
3. A notes section which sends messages to the DJ Bot in order to log them in-sync with the video.

#### Requirements
1. NodeJS and NPM
2. An open network port that can be used for serving the web application.
3. [forever.js](https://github.com/foreverjs/forever) (a system to keep node apps running in the background)
4. A known MQTT broker

#### Instructions
1. Clone this repo using git
2. Navigate to `CONTROL` directory using your Terminal
3. Run `npm install`
4. Run `forever start control.js -l out.log -e err.log`
