/*
 * Copyright (c) 2008-2015 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

Ext.require([
    'Ext.container.Viewport',
    'Ext.layout.container.Border',
    'GeoExt.tree.Panel',
    'Ext.tree.plugin.TreeViewDragDrop',
    'GeoExt.panel.Map',
    'GeoExt.tree.OverlayLayerContainer',
    'GeoExt.tree.BaseLayerContainer',
    'GeoExt.data.LayerTreeModel',
    'GeoExt.tree.View',
    'GeoExt.tree.Column',
    'GeoExt.tree.LayerTreeBuilder'
]);

var mapPanel, tree;

Ext.application({
    name: 'Tree',
    launch: function() {
        // create a map panel with some layers that we will show in our layer tree
        // below.
        mapPanel = Ext.create('GeoExt.panel.Map', {
            border: true,
            region: "center",
            // we do not want all overlays, to try the OverlayLayerContainer
            map: {allOverlays: false},
            center: [14, 37.5],
            zoom: 7,
            layers: [
                new OpenLayers.Layer.WMS("Global Imagery",
                    "http://maps.opengeo.org/geowebcache/service/wms", {
                        layers: "bluemarble",
                        format: "image/png8"
                    }, {
                        buffer: 0,
                        visibility: false,
                        group: 'World base maps/Imagery'
                    }
                ),
                new OpenLayers.Layer.WMS("OpenStreetMap WMS",
                    "http://ows.terrestris.de/osm/service?",
                    {layers: 'OSM-WMS'},
                    {
                        attribution: '&copy; terrestris GmbH & Co. KG <br>' +
                            'Data &copy; OpenStreetMap ' +
                            '<a href="http://www.openstreetmap.org/copyright/en"' +
                            'target="_blank">contributors<a>',
                        group: 'World base maps/Vector'
                    }
                ),
                new OpenLayers.Layer.WMS("Country Borders",
                    "http://ows.terrestris.de/geoserver/osm/wms", {
                        layers: "osm:osm-country-borders",
                        transparent: true,
                        format: "image/png"
                    }, {
                        isBaseLayer: false,
                        resolutions: [
                            1.40625,
                            0.703125,
                            0.3515625,
                            0.17578125,
                            0.087890625,
                            0.0439453125,
                            0.02197265625,
                            0.010986328125,
                            0.0054931640625
                        ],
                        buffer: 0,
                        group: 'Additional layers/World/Administrative'
                    }
                ),
                new OpenLayers.Layer.WMS("Gas Stations",
                    "http://ows.terrestris.de/geoserver/osm/wms", {
                        layers: "osm:osm-fuel",
                        transparent: true,
                        format: "image/png"
                    }, {
                        isBaseLayer: false,
                        buffer: 0
                    }
                ),
                new OpenLayers.Layer.WMS("Bus Stops",
                    "http://ows.terrestris.de/osm-haltestellen?",
                    {
                        layers: 'OSM-Bushaltestellen',
                        format: 'image/png',
                        transparent: true
                    },
                    {
                        singleTile: true,
                        visibility: false
                    }
                )
            ]
        });

        var novatree = Ext.create('GeoExt.tree.LayerTreeBuilder', {
            enableWmsLegends: false,
            enableVectorLegends: false,
            otherLayersText: 'Utilities',
            border: true,
            layerStore: mapPanel.layers,
            region: "west",
            title: "Layers",
            width: 250,
            split: true,
            collapsible: true,
            collapseMode: "mini",
            autoScroll: true
        });

        Ext.create('Ext.Viewport', {
            layout: "fit",
            hideBorders: true,
            items: {
                layout: "border",
                deferredRender: false,
                items: [mapPanel, novatree, {
                    contentEl: "desc",
                    region: "east",
                    bodyStyle: {"padding": "5px"},
                    collapsible: true,
                    collapseMode: "mini",
                    split: true,
                    width: 200,
                    title: "Description"
                }]
            }
        });
    }
});
