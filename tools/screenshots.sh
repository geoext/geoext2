#!/usr/bin/env bash

function die () {
    echo >&2 "$@"
    exit 1
}

function chkcmd {
    which $1 >/dev/null
    if [ $? -ne 0 ];then
        die "Program '$1' not found."
    fi
}
chkcmd "phantomjs"
chkcmd "convert"

# check that we have exactly one argument
[ "$#" -eq 1 ] || die "1 argument required, $# provided"

echo $SCRIPTDIR
echo $exampleUrl

# take screenshots - requires phantomjs
phantomjs "$SCRIPTDIR/screenshots.js" $exampleUrl $SCRIPTDIR

# resize screenshots - requires imagemagick
for THUMB in $(find "$SCRIPTDIR/examples" | grep thumb.png) 
do 
  convert -resize 118X90 $THUMB $THUMB
done
