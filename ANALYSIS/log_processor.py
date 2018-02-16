# @Author: Nik Martelaro <nikmart>
# @Date:   2018-02-13T23:36:05-05:00
# @Email:  nmartelaro@gmail.com
# @Filename: log_processor.py
# @Last modified by:   nikmart
# @Last modified time: 2018-02-14T14:24:13-05:00
#
#
# Purpose: To process the DJ Bot log files
#
# Usage: python convertResponses.py [logfile.log] [starttime]
# [logfile]: A .log file with all recorded events from a DJ Bot session
# [startime]: The start time of the DJ Bot video, allows us to synchronize

import sys
import calendar
from iso8601 import parse_date

# CONSTANTS
MSG_TYPE = 1


# FUNCTIONS
# Convert IS) 8601 time to Unix time [1]
def iso2unix(timestamp):
    """
    Convert a UTC timestamp formatted in ISO 8601 into a UNIX timestamp
    """
    # use iso8601.parse_date to convert the timestamp into a datetime object.
    parsed = parse_date(timestamp)
    # now grab a time tuple that we can feed mktime
    timetuple = parsed.timetuple()
    # return a unix timestamp
    return calendar.timegm(timetuple)

logfile = sys.argv[1]
starttime = float(sys.argv[2])

# Create an output CSVs that we can import into Chronoviz
djbot_speech = open('djbot_speech.tsv', 'w')
djbot_speech.write('TIME\tDJ_SPEECH\n')

notes = open('notes.tsv', 'w')
notes.write('TIME\tNOTE\n')

volume = open('volume.tsv', 'w')
volume.write('TIME\tVOLUME\n')

songs = open('songs.tsv', 'w')
songs.write('TIME\tSONG\n')

session_info = open('session_info.txt', 'w')

# COUNTERS
song_count = 0
note_count = 0
speech_count = 0

with open(logfile) as log:
    song = ''
    for row in log:
        # first take care of the messages, volume, and notes
        if '{' not in row and row[0] == '[':
            row = row.strip().split(' ', 2) # only split two times
            time = iso2unix(row[0][1:-1]) - starttime
            #time = float(dp.parse(row[0][1:-1]).strftime('%s'))
            # - starttime
            msg = row[2]
            if "vol" in row[MSG_TYPE]:
                volume.write('{}\t{}\n'.format(time, msg))
                #print('{}\t{}\n'.format(time, msg))
            elif "say" in row[MSG_TYPE]:
                djbot_speech.write('{}\t{}\n'.format(time, msg))
                speech_count += 1
                #print('{}\t{}\n'.format(time, msg))
            elif "note" in row[MSG_TYPE]:
                notes.write('{}\t{}\n'.format(time, msg))
                note_count += 1
                #print('{}\t{}\n'.format(time, msg))
        # find the songs and put together the JSON string
        elif '{' in row and row[0] == '[':
            row = row.strip().split(' ', 2) # only split two times
            time = iso2unix(row[0][1:-1]) - starttime
            song = ' '.join(row[1:]) + ' '
        # write data if you are done with the songs
        elif '}' in row:
            song += row.strip()
            songs.write('{}\t{}\n'.format(time, song))
            song_count += 1
            song = '' # reset the song
        # find the rest of the song data
        elif row[0] == ' ':
            song += row.strip() + ' '

print('Songs Played: {}\nDJ Bot Utterancs: {}\nNotes Taken: {}'.format(song_count, speech_count, note_count))
session_info.write('Songs Played: {}\nDJ Bot Utterancs: {}\nNotes Taken: {}\n'.format(song_count, speech_count, note_count))
# REFERENCES:
#[1] ISO 8601 to UNIX (seconds) - https://gist.github.com/rca/3702066
