#!/usr/bin/env bash

function chkcmd {
    which $1 >/dev/null
    if [ $? -ne 0 ];then
        echo "Program '$1' not found."
        exit 1
    fi
}
chkcmd "phantomjs"
chkcmd "convert"

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
exampleUrl=$1

# take screenshots - requires phantomjs
phantomjs "$SCRIPTDIR/screenshots.js" exampleUrl

# resize screenshots - requires imagemagick
for THUMB in $(find "$SCRIPTDIR/examples" | grep thumb.png) 
do 
  convert -resize 118X90 $THUMB $THUMB
done
