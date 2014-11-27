/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/** api: example[feature-grid-w-proxy]
 *  Grid with Features via Proxy
 *  ------------------
 *  Synchronize selection of features between a grid and a layer.
 */

var mapPanel, store, gridPanel, mainPanel;

Ext.require([
    'GeoExt.panel.Map',
    'GeoExt.data.FeatureStore',
    'GeoExt.data.proxy.Protocol',
    'GeoExt.selection.FeatureModel',
    'Ext.grid.GridPanel',
    'Ext.layout.container.Border'
]);

Ext.application({
    name: 'Feature Grid with Proxy - GeoExt2',
    launch: function() {
        // create map instance
        var map = new OpenLayers.Map({projection: 'EPSG:900913'});
        var wmsLayer = new OpenLayers.Layer.WMS(
            "OpenStreetMap WMS",
            "http://ows.terrestris.de/osm-gray/service?",
            {layers: 'OSM-WMS'},
            {
                attribution: '&copy; terrestris GmbH & Co. KG <br>' +
                    'Data &copy; OpenStreetMap ' +
                    '<a href="http://www.openstreetmap.org/copyright/en"' +
                    'target="_blank">contributors<a>'
            }
        );

        // create vector layer
        var template = {
            cursor: "pointer",
            fillOpacity: 0.8,
            fillColor: "blue",
            pointRadius: 9,
            label: 'H',
            labelAlign: "center",
            fontColor: "white",
            fontSize: "12px",
            strokeWidth: 2,
            strokeOpacity: 1,
            strokeColor: "yellow",
            graphicName: "circle"
        };
        var defStyle = new OpenLayers.Style(template);
        var selStyle = new OpenLayers.Style(
            Ext.apply(
                Ext.apply({}, template),
                {
                    strokeWidth: 3,
                    pointRadius: 15,
                    fontSize: "15px",
                    fontWeight: "bold"
               }
            )
        );
        var vecLayer = new OpenLayers.Layer.Vector("vector", {
            styleMap: new OpenLayers.StyleMap({
                'default': defStyle,
                'select': selStyle
            })
        });
        map.addLayers([wmsLayer, vecLayer]);

        // create map panel
        mapPanel = Ext.create('GeoExt.panel.Map', {
            title: "Map",
            region: "center",
            height: 400,
            width: 600,
            map: map,
            center: new OpenLayers.LonLat(670199.86402052, 6178328.5593591),
            zoom: 4
        });

        // create feature store, binding it to the vector layer 
        store = Ext.create('GeoExt.data.FeatureStore', {
            layer: vecLayer,
            fields: [
                {name: 'name', type: 'string'}
            ],
            autoLoad: true,
            proxy: Ext.create('GeoExt.data.proxy.Protocol', {
                reader: Ext.create('GeoExt.data.reader.Feature', {root: 'features'}),
                protocol: new OpenLayers.Protocol.HTTP({
                    url: "../data/busstops.geojson",
                    format: new OpenLayers.Format.GeoJSON({})
                })
            })
        });

        // create grid panel configured with feature store
        gridPanel = Ext.create('Ext.grid.GridPanel', {
            title: "Feature Grid",
            region: "east",
            store: store,
            width: 340,
            columns: [{
                header: "Name",
                flex: 1,
                dataIndex: "name"
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

