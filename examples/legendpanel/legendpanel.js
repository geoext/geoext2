/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/** api: example[legendpanel]
 *  Legend Panel
 *  ------------
 *  Display a layer legend in a panel.
 */

var mapPanel, legendPanel;

Ext.require([
    'Ext.container.Viewport',
    'Ext.layout.container.Border',
    'GeoExt.panel.Map', 
    'GeoExt.container.WmsLegend',
    'GeoExt.container.UrlLegend',
    'GeoExt.container.VectorLegend',
    'GeoExt.panel.Legend'
]);

// Wrap the application initialization in Ext.onReady, this is needed because of
// the way we include ExtJS dynamically in these examples.
Ext.onReady(function(){


Ext.application({
    name: 'LegendPanel GeoExt2',
    launch: function() {
        var map = new OpenLayers.Map({allOverlays: true, fallThrough: true});
        map.addLayers([
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
            new OpenLayers.Layer.WMS(
                "Subway Stops",
                "http://ows.terrestris.de/osm-haltestellen?",
                {
                    layers: 'OSM-Strassenbahnhaltestellen', 
                    format: 'image/png', 
                    transparent: true
                },
                {
                    singleTile: true
                }),
            new OpenLayers.Layer.Vector('Polygons', {
                styleMap: new OpenLayers.StyleMap({
                    "default": new OpenLayers.Style({
                        pointRadius: 8,
                        fillColor: "#00ffee",
                        strokeColor: "#000000",
                        strokeWidth: 2
                    })
                })
            })
        ]);
        map.layers[2].addFeatures([
            new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.fromWKT(
                    "POLYGON(6.8467 50.938, 6.8531 50.9433, 6.858 50.9395, 6.8467 50.938)"
                )
            )
        ]);

        mapPanel = Ext.create('GeoExt.panel.Map', {
            region: 'center',
            height: 400,
            width: 600,
            map: map,
            center: new OpenLayers.LonLat(6.85260, 50.9396),
            zoom: 15
        });

        // give the record of the 1st layer a legendURL, which will cause
        // UrlLegend instead of WMSLegend to be used
        var layerRec0 = mapPanel.layers.getAt(0);
        layerRec0.set("legendURL", "http://ows.terrestris.de/osm/service?FORMAT=image%2Fgif&TRANSPARENT=true&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&EXCEPTIONS=application%2Fvnd.ogc.se_xml&LAYER=OSM-WMS");
        
        legendPanel = Ext.create('GeoExt.panel.Legend', {
            defaults: {
                labelCls: 'mylabel',
                style: 'padding:5px'
            },
            bodyStyle: 'padding:5px',
            width: 350,
            autoScroll: true,
            region: 'west'
        });
        
        // functions for interacting with the map's layers to show how the
        // legend instantly reflects changes
        function addRemoveLayer() {
            if(Ext.Array.indexOf(map.layers, busstops) == -1) {
                map.addLayer(busstops);
            } else {
                map.removeLayer(busstops);
            }
        }        
        function moveLayer() {
            var layer = layerRec0.getLayer();
            var idx = Ext.Array.indexOf(map.layers, layer) === 0 ?
                map.layers.length : 0;
            map.setLayerIndex(layerRec0.getLayer(), idx);
        }
        function toggleVisibility() {
            var layer = layerRec1.getLayer();
            layer.setVisibility(!layer.getVisibility());
        }
        function updateHideInLegend() {
            layerRec0.set("hideInLegend", !layerRec0.get("hideInLegend"));
        }
        function updateLegendUrl() {
            var url = layerRec0.get("legendURL");
            layerRec0.set("legendURL", otherUrl);
            otherUrl = url;
        }
        // store the layer that we will modify in toggleVis()
        var layerRec1 = mapPanel.layers.getAt(1);
        // stores another legendURL for the legendurl button action
        var otherUrl = "http://www.geoext.org/trac/geoext/chrome/site/img/GeoExt.png";
        // create another layer for the add/remove button action
        var busstops = new OpenLayers.Layer.WMS("Bus Stops",
            "http://ows.terrestris.de/osm-haltestellen?",
            {layers: 'OSM-Bushaltestellen', format: 'image/png', transparent: true},
            {singleTile: true});

        Ext.create('Ext.panel.Panel', {
            layout: 'border',
            renderTo: 'view',
            width: 800,
            height: 400,
            items: [mapPanel, legendPanel],
            tbar: Ext.create('Ext.Toolbar', {
                items: [
                    {text: 'add/remove', handler: addRemoveLayer},
                    {text: 'movetop/bottom', handler: moveLayer },
                    {text: 'togglevis', handler: toggleVisibility},
                    {text: 'hide/show', handler: updateHideInLegend},
                    {text: 'legendurl', handler: updateLegendUrl}
                ]
            })
        });
    }
});


}); // end of Ext.onReady (needed for the way we include ExtJS dynamically)
