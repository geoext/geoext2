/**
 * Copyright (c) 2008-2010 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/** api: example[legendpanel]
 *  Legend Panel
 *  ------------
 *  Display a layer legend in a panel.
 */

Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        GeoExt: "../../src/GeoExt"
    }
});

var mappanel, legendPanel;

Ext.require(['GeoExt.panel.Map', 'GeoExt.legend.WMSLayer', 'GeoExt.panel.Legend']);

Ext.application({
    name: 'LegendPanel GeoExt2',
    launch: function() {
        var map = new OpenLayers.Map({
            allOverlays: true
        });
        map.addLayers([
            

            new OpenLayers.Layer.WMS(
                "Tasmania",
                "http://demo.opengeo.org/geoserver/wms?",
                {
                    layers: 'topp:tasmania_state_boundaries', 
                    format: 'image/png', 
                    transparent: true
                },

                {
                    singleTile: true
                }),            
            new OpenLayers.Layer.WMS(
                "Cities and Roads",
                "http://demo.opengeo.org/geoserver/wms?",
                {
                    layers: 'topp:tasmania_cities,topp:tasmania_roads', 
                    format: 'image/png', 
                    transparent: true
                },

                {
                    singleTile: true
                })
                ,
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
            new OpenLayers.Feature.Vector(OpenLayers.Geometry.fromWKT(
                "POLYGON(146.1 -41, 146.2 -41, 146.2 -41.1, 146.1 -41.1)"))
            ]);

        mappanel = Ext.create('GeoExt.panel.Map', {
            region: 'center',
            height: 400,
            width: 600,
            map: map,
            center: new OpenLayers.LonLat(146.4, -41.6),
            zoom: 7
        });
        var layerRec0 = mappanel.layers.getAt(0);
        layerRec0.set("legendURL", "http://demo.opengeo.org/geoserver/wms?FORMAT=image%2Fgif&TRANSPARENT=true&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetLegendGraphic&EXCEPTIONS=application%2Fvnd.ogc.se_xml&LAYER=topp%3Atasmania_state_boundaries");


        //        console.log('mappanel',mappanel);
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
        Ext.create('Ext.container.Viewport', {
            layout: 'border',
            items: [
            mappanel,legendPanel
            ]
        });

    }
});


