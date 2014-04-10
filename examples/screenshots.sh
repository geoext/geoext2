exampleUrl = $1

phantomjs screenshots.js $1
# requires imagemagick
for THUMB in $(find . | grep thumb.png); do convert -resize 118X90 $THUMB $THUMB; done