#!/bin/bash

printf "Video startup for DJ Bot\n"
printf "Participant ID: "
read answer
printf "$answer\n"

# start the bot using forever.js, sending the log files to the session folder
cd ~/Desktop/DJ-Bot-Sessions
# create a new directory for the participant and go to that directory
mkdir "$answer"
mkdir "$answer"/LOGS

forever start -o "$answer"/LOGS/out.log -e "$answer"/LOGS/err.log ~/GitRepos/DJBot-at-Home/BOT/bot.js
