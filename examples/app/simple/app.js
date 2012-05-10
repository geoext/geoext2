/**
 * Ext.Loader
 */
Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        GeoExt: "../../../src/GeoExt",
        Ext: "http://cdn.sencha.io/ext-4.1.0-gpl/src"
    }
});

/**
 * GX.app
 * A MVC application demo that uses GeoExt and Ext components to display
 * geospatial data.
 */
Ext.application({
    name: 'GX',
    appFolder: 'app',
    controllers: [
        'Map'   
    ],
    autoCreateViewport: true
});

/**
 * For dev purpose only
 */
var ctrl;
