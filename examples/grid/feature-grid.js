/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/** api: example[feature-grid]
 *  Grid with Features
 *  ------------------
 *  Synchronize selection of features between a grid and a layer.
 */

var mapPanel, store, gridPanel, mainPanel;

Ext.require([
    'GeoExt.panel.Map',
    'GeoExt.data.FeatureStore',
    'GeoExt.grid.column.Symbolizer',
    'GeoExt.selection.FeatureModel',
    'Ext.grid.GridPanel',
    'Ext.layout.container.Border'
]);


// Wrap the application initialization in Ext.onReady, this is needed because of
// the way we include ExtJS dynamically in these examples.
Ext.onReady(function(){


Ext.application({
    name: 'Feature Grid - GeoExt2',
    launch: function() {
        // create map instance
        var map = new OpenLayers.Map({allOverlays: true, fallThrough: true});
        var wmsLayer = new OpenLayers.Layer.WMS(
            "OpenStreetMap WMS",
            "http://ows.terrestris.de/osm/service?",
            {layers: 'OSM-WMS'},
            {
                attribution: '&copy; terrestris GmbH & Co. KG <br>' +
                    'Data &copy; OpenStreetMap ' +
                    '<a href="http://www.openstreetmap.org/copyright/en"' +
                    'target="_blank">contributors<a>'
            }
        );

        // create vector layer
        var context = {
            getColor: function(feature) {
                if (feature.attributes.elevation < 2000) {
                    return 'green';
                }
                if (feature.attributes.elevation < 2300) {
                    return 'orange';
                }
                return 'red';
            }
        };
        var template = {
            cursor: "pointer",
            fillOpacity: 0.5,
            fillColor: "${getColor}",
            pointRadius: 5,
            strokeWidth: 1,
            strokeOpacity: 1,
            strokeColor: "${getColor}",
            graphicName: "triangle"
        };
        var style = new OpenLayers.Style(template, {context: context});
        var vecLayer = new OpenLayers.Layer.Vector("vector", {
            styleMap: new OpenLayers.StyleMap({
                'default': style
            }),
            protocol: new OpenLayers.Protocol.HTTP({
                url: "../data/summits.json",
                format: new OpenLayers.Format.GeoJSON()
            }),
            strategies: [new OpenLayers.Strategy.Fixed()]
        });
        map.addLayers([wmsLayer, vecLayer]);

        // create map panel
        mapPanel = Ext.create('GeoExt.panel.Map', {
            title: "Map",
            region: "center",
            height: 400,
            width: 600,
            map: map,
            center: new OpenLayers.LonLat(5, 45),
            zoom: 6
        });

        // create feature store, binding it to the vector layer
        store = Ext.create('GeoExt.data.FeatureStore', {
            layer: vecLayer,
            fields: [
                {
                    name: 'symbolizer',
                    convert: function(v, r) {
                        var dataKey = GeoExt.isExt4 ? 'raw' : 'data',
                            data = r[dataKey];
                        return data.layer.styleMap.createSymbolizer(data, 'default');
                    }
                },
                {name: 'name', type: 'string'},
                {name: 'elevation', type: 'float'}
            ]
        });

        // create grid panel configured with feature store
        gridPanel = Ext.create('Ext.grid.GridPanel', {
            title: "Feature Grid",
            region: "east",
            store: store,
            width: 340,
            columns: [{
                menuDisabled: true,
                sortable: false,
                width: 30,
                xtype: 'gx_symbolizercolumn',
                dataIndex: "symbolizer"
            }, {
                header: "Name",
                width: 200,
                dataIndex: "name"
            }, {
                header: "Elevation",
                width: 100,
                dataIndex: "elevation"
            }],
            selType: 'featuremodel'
        });

        // create a panel and add the map panel and grid panel
        // inside it
        mainPanel = Ext.create('Ext.Panel', {
            renderTo: "mainpanel",
            layout: "border",
            height: 400,
            width: 920,
            items: [mapPanel, gridPanel]
        });
    }
});


}); // end of Ext.onReady (needed for the way we include ExtJS dynamically)