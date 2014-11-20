/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

Ext.require([
    'Ext.layout.container.Fit',
    'GeoExt.panel.Map',
    'GeoExt.data.MapfishPrintProvider',
    'GeoExt.plugins.PrintExtent'
]);

var mapPanel, printProvider;

Ext.onReady(function(){

    Ext.application({
        name: 'PrintExtentGeoExt2',
        launch: function() {

            // The printProvider that connects us to the print service
            printProvider = Ext.create('GeoExt.data.MapfishPrintProvider', {
                method: "GET", // "POST" recommended for production use
                capabilities: printCapabilities, // from the info.json script in the html
                customParams: {
                    mapTitle: "Printing Demo",
                    comment: "This is a map printed from GeoExt."
                }
            });

            var printExtent = Ext.create('GeoExt.plugins.PrintExtent', {
                printProvider: printProvider
            });

            // The map we want to print, with the PrintExtent added as item.
            mapPanel = Ext.create('GeoExt.panel.Map', {
                renderTo: "content",
                width: 450,
                height: 320,
                layers: [new OpenLayers.Layer.WMS(
                    "OpenStreetMap WMS",
                    "http://ows.terrestris.de/osm/service?",
                    {layers: 'OSM-WMS'},
                    {
                        attribution: '&copy; terrestris GmbH & Co. KG <br>' +
                            'Data &copy; OpenStreetMap ' +
                            '<a href="http://www.openstreetmap.org/copyright/en"' +
                            'target="_blank">contributors<a>'
                    }
                )],
                center: [146.56, -41.56],
                zoom: 6,
                plugins: [printExtent],
                bbar: [{
                    text: "Create PDF",
                    handler: function() {
                        // the PrintExtent plugin is the mapPanel's 1st plugin
                        mapPanel.plugins[0].print();
                    }
                }]
            });
            printExtent.addPage();
        }
    });
});