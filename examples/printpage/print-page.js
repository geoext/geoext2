 /**
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/** api: example[print-page]
 *  Print Your Map
 *  --------------
 *  Print the visible extent of a MapPanel with PrintPage and PrintProvider.
 */

Ext.require([
    'Ext.layout.container.Border',
    'Ext.form.field.Checkbox',
    'GeoExt.data.PrintProvider',
    'GeoExt.data.PrintPage',
    'GeoExt.panel.Map',
    'GeoExt.panel.Legend',
    'GeoExt.container.WmsLegend',
    'GeoExt.container.UrlLegend',
    'GeoExt.container.VectorLegend'
]);

var mapPanel, printPage, printProvider;

Ext.application({
    name: 'PrintPage and PrintProvider - GeoExt2',
    launch: function() {
        // The printProvider that connects us to the print service
    printProvider = Ext.create('GeoExt.data.PrintProvider', {
        method: "GET", // "POST" recommended for production use
        capabilities: printCapabilities, // from the info.json script in the html
        customParams: {
            mapTitle: "Printing Demo",
            comment: "This is a simple map printed from GeoExt."
        }
    });
    // Our print page. Tells the PrintProvider about the scale and center of
    // our page.
    printPage = Ext.create('GeoExt.data.PrintPage', {
        printProvider: printProvider
    });

    // The map we want to print
    mapPanel = Ext.create('GeoExt.panel.Map', {
        region: "center",
        layers: [
            new OpenLayers.Layer.WMS(
                "Tasmania",
                "http://demo.opengeo.org/geoserver/wms",
                { layers: "topp:tasmania_state_boundaries" },
                { singleTile: true }
            )
        ],
        center: [146.56, -41.56],
        zoom: 7
    });
    // The legend to optionally include on the printout
    var legendPanel = Ext.create('GeoExt.panel.Legend',{
        region: "west",
        width: 150,
        bodyStyle: "padding:5px",
        layerStore: mapPanel.layers
    });
    
    var includeLegend; // controlled by the "Include legend?" checkbox
     
    // The main panel
    new Ext.Panel({
        renderTo: "content",
        layout: "border",
        width: 700,
        height: 420,
        items: [mapPanel, legendPanel],
        bbar: ["->", {
            text: "Print",
            handler: function() {
                // convenient way to fit the print page to the visible map area
                printPage.fit(mapPanel, true);
                // print the page, optionally including the legend
                printProvider.print(mapPanel, printPage, includeLegend && {legend: legendPanel});
            }
        }, {
            xtype: "checkbox",
            boxLabel: "Include legend?",
            handler: function() {
                includeLegend = this.checked;
            }
        }]
    });
    }
});

