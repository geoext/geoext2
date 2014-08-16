/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/** api: example[permalink]
 *  Permalink
 *  ---------
 *  Display a permalink each time the map changes position.
 */

Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        GeoExt: "../../src/GeoExt"
    }
});

Ext.require([
    'Ext.container.Viewport',
    'Ext.window.MessageBox',
    'GeoExt.panel.Map',
    'GeoExt.state.PermalinkProvider'
]);

var permalinkProvider;

Ext.application({
    name: 'HelloGeoExt2',
    launch: function() {
        permalinkProvider = Ext.create('GeoExt.state.PermalinkProvider', {
            encodeType: false
        });
        Ext.state.Manager.setProvider(permalinkProvider);

        var map = new OpenLayers.Map({});
        var ol_wms = new OpenLayers.Layer.WMS(
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
        
        map.addLayers([ol_wms]);
        
        var mappanel = Ext.create('GeoExt.panel.Map', {
            renderTo: 'mappanel',
            width: 400,
            height: 400,
            title: 'The GeoExt.panel.Map-class',
            map: map,
            stateful: true,
            stateId: 'mappanel',
            center: '12.3,38.9',
            zoom: 5,
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    text: 'Current center of the map',
                    handler: function(){
                        var c = GeoExt.panel.Map.guess().map.getCenter();
                        Ext.Msg.alert(this.getText(), c.toString());
                    }
                }]
            }]
        });
        
        // update link when state changes
        var onStatechange = function(provider) {
            var l = provider.getLink();
            Ext.get("permalink").update("<a href=" + l + ">" + l + "</a>");
        };
        permalinkProvider.on({
            statechange: onStatechange
        });

    }
});
