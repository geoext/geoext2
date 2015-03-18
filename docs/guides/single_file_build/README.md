# Sencha Cmd

Assuming that you have Ext JS 4 SDK at the parent path ../ext-4.2.1.883 you can create a compressed full single file build with the following command line:

    sencha -sdk ../ext-4.2.1.883 compile --classpath=src exclude -all and include -namespace GeoExt and concat -closure geoext2.js

Refer to [this page](http://www.sencha.com/products/sencha-cmd) for more information about Sencha Cmd.

# Jsbuild

Assuming you have jsbuild available at command line simply run the following command to create a full single file build:

    jsbuild ./build.cfg

Refer to [this page](https://github.com/whitmo/jstools) for more information about jsbuild.
