#!/bin/sh
sencha -sdk ../ext-4.2.1.883 compile --classpath=src exclude -all and include -namespace GeoExt and concat -closure geoext2-all.js
