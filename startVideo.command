#!/bin/bash

printf "Video startup for DJ Bot\n"
printf "Participant ID: "
read answer
printf "$answer\n"

cd ~/Desktop/DJ-Bot-Sessions

# create a new directory for the participant and go to that directory
mkdir "$answer"
mkdir "$answer"/VIDEO

# start the video recording
python ~/GitRepos/DJBot-at-Home/startVideo.py "$answer"/VIDEO
