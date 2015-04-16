# Sencha Cmd (GeoExt as an ExtJS package)

GeoExt is an ExtJS package and can be used in tandem with the Sencha Cmd tool to produce optimized one file builds of your app:

After initializing your ExtJS workspace and generating your app, you may add
GeoExt as a package by cloning it into `packages/GeoExt` of your workspace. The name is important here, as otherwise the `GeoExt` package will not be recognized in your development environment. Secondly, to make the GeoExt classes available to your app you will have to add 'GeoExt' as a requirement in your apps `app.json` configuration file.

You may now `sencha app watch` your apps directory and start requiring GeoExt classes. Via `sencha app build` you can easily generate custom builds of your app that only comprises ExtJS and GeoExt classes that you actually use.

A simple workflow to create a new workspace and app may look as following (the `sencha` command needs to be available in your class path):
````
# generate workspace in directory "test"
sencha --sdk ~/Downloads/ext-5.1.0 generate workspace test

# switch to workspace dir
cd test

# generate app "TestApp" in directoy "appdir"
sencha --sdk ~/Downloads/ext-5.1.0 generate app TestApp appdir

# clone GeoExt package into folder "package/GeoExt" of your workspace
git clone https://github.com/geoext/geoext2.git packages/GeoExt

# edit app.json in appdir to require GeoExt package
...
"requires": [
    "GeoExt"
],
...

# watch your app directory and start editing
cd appdir
sencha app watch
````

# Sencha Cmd

Assuming that you have Ext JS 4 SDK at the parent path ../ext-4.2.1.883 you can create a compressed full single file build with the following command line:

    sencha -sdk ../ext-4.2.1.883 compile --classpath=src exclude -all and include -namespace GeoExt and concat -closure geoext2.js

Refer to [this page](http://www.sencha.com/products/sencha-cmd) for more information about Sencha Cmd.

# Jsbuild

Assuming you have jsbuild available at command line simply run the following command to create a full single file build:

    jsbuild ./build.cfg

Refer to [this page](https://github.com/whitmo/jstools) for more information about jsbuild.
