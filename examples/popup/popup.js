/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/** api: example[popup]
 *  Feature Popup
 *  -------------
 *  Display a popup with feature information.
 */

Ext.require([
    'Ext.Window',
    'GeoExt.panel.Map',
    'GeoExt.window.Popup'
]);

if(!Ext.isDefined(Ext.DomQuery)) {
    // Ext.DomQuery is replaced by Ext.dom.Query when using ExtJS5
    Ext.require('Ext.dom.Query');
}


var mapPanel, popup;

Ext.onReady(function() {

    // create a vector layer, add a feature into it
    var vectorLayer = new OpenLayers.Layer.Vector("vector");
    vectorLayer.addFeatures(
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(-45, 5)
        )
    );

    // create select feature control
    var selectCtrl = new OpenLayers.Control.SelectFeature(vectorLayer);

    // define "createPopup" function
    var bogusMarkup = "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. " +
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. " +
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit." +
            "Lorem ipsum dolor sit amet, consectetuer adipiscing elit.";
    
    function createPopup(feature) {
        var DomQuery = GeoExt.isExt4 ? Ext.DomQuery : Ext.dom.Query,
            checkConstrOpt = DomQuery.select('input[name="constrainOpt"]:checked')[0].value,
            undef,
            constrainOpts = {
                constrain: (checkConstrOpt === 'constrain-full') ? true : undef,
                constrainHeader: (checkConstrOpt === 'constrain-header') ? true : undef
            },
            popupOpts = Ext.apply({
                title: 'My Popup',
                location: feature,
                width:200,
                html: bogusMarkup,
                maximizable: true,
                collapsible: true,
                anchorPosition: 'auto'
            }, constrainOpts);

        popup = Ext.create('GeoExt.window.Popup', popupOpts);
        // unselect feature when the popup
        // is closed
        popup.on({
            close: function() {
                if(OpenLayers.Util.indexOf(vectorLayer.selectedFeatures,
                                           this.feature) > -1) {
                    selectCtrl.unselect(this.feature);
                }
            }
        });
        popup.show();
    }

    // create popup on "featureselected"
    vectorLayer.events.on({
        featureselected: function(e) {
            createPopup(e.feature);
        }
    });

    // create Ext window including a map panel
    var mapwin = Ext.create('Ext.Window', {
        layout: "fit",
        title: "Map",
        closeAction: "hide",
        width: 600,
        height: 400,
        x: 20,
        y: 250,
        items: {
            xtype: "gx_mappanel",
            border: false,
            region: "center",
            layers: [
                new OpenLayers.Layer.WMS( 
                    "OpenStreetMap WMS",
                    "http://ows.terrestris.de/osm/service?",
                    {layers: 'OSM-WMS'},
                    {
                        attribution: '&copy; terrestris GmbH & Co. KG <br>' +
                            'Data &copy; OpenStreetMap ' +
                            '<a href="http://www.openstreetmap.org/copyright/en"' +
                            'target="_blank">contributors<a>'
                    }
                ),
                new OpenLayers.Layer.Vector('vector',{
                    isBaseLayer: true
                }),
                vectorLayer
            ]
        }
    });
    mapwin.show();

    mapPanel = mapwin.items.get(0);
    mapPanel.map.addControl(selectCtrl);
    selectCtrl.activate();
});
