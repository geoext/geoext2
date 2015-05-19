/**
 * The specific controller for the Map class
 */
Ext.define('CF.view.map.MapController', {
    extend: 'Ext.app.ViewController',

    requires: [],

    alias: 'controller.map',

    /**
     * @private
     */
    init: function() {
        var me = this;

        this.control({
            'cf_mappanel': {
                'beforerender': this.onMapPanelBeforeRender,
                'afterrender': this.onMapPanelAfterRender
            }
        }, this);
    },

    /**
     * @private
     */
    onMapPanelBeforeRender: function(mapPanel, options) {
        var me = this;

        var layers = [];

        // OpenLayers object creating
        var wms = new OpenLayers.Layer.WMS(
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
        layers.push(wms);

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
        vecLayer = new OpenLayers.Layer.Vector("vector", {
            styleMap: new OpenLayers.StyleMap({
                'default': style
            }),
            protocol: new OpenLayers.Protocol.HTTP({
                url: "resources/data/summits.json",
                format: new OpenLayers.Format.GeoJSON()
            }),
            strategies: [new OpenLayers.Strategy.Fixed()]
        });
        layers.push(vecLayer);

        mapPanel.map.addLayers(layers);

        // manually bind store to layer
        var summitStore =  Ext.data.StoreManager.lookup('summitStore');
        summitStore.bind(vecLayer);

        // some more controls
        mapPanel.map.addControls([new OpenLayers.Control.DragFeature(vecLayer, {
            autoActivate: true,
            onComplete: function(feature, px) {
                summitStore.fireEvent('update', summitStore, summitStore.getByFeature(feature));
            }
        })]);
    },

    onMapPanelAfterRender: function() {
        // bind selection model to layer
        var summitGrid = Ext.ComponentQuery.query('cf_summitgrid')[0];
        var selectCtrl = summitGrid.getSelectionModel().bindLayer(vecLayer);
    }

});
