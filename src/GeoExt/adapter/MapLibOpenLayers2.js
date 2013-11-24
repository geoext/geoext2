/**
 *
 */
Ext.define('GeoExt.adapter.MapLibOpenLayers2', {
    extend: 'GeoExt.adapter.MapLib',
    requires: [

    ],

    mixins: {
        mapLibAdapter: 'GeoExt.adapter.MapLib'
    },

    map: null,

    /**
     *
     */
    constructor: function(config) {
        this.initConfig(config);
    },

    /**
     *
     */
    applyCentreOfTheMap: function(lonLat) {
        // GeoExt abstraction for position
        var pos = [lonLat.lon, lonLat.lat];

        // optional (only implementation logic)
        this.recenterMap(lonLat);

        return pos;
    },

    /**
     *
     */
    applyExtentOfTheMap: function(bounds) {

        //eventually redraw map with new extent
        return bounds.toString();
    },

    /**
     *
     */
    applyLayersOfTheMap: function() {
        throw new Error('applyLayersOfTheMap must be implemented');
    },

    /**
     *
     */
    applyMapObject: function(olMap) {
        return olMap;
    },

    /**
     *
     */
    applyZoomOfTheMap: function(zoom) {
        //eventually zoom the map
        return zoom;
    },

    /**
     *
     */
    createMap: function() {
        var map = new OpenLayers.Map({
                projection: new OpenLayers.Projection("EPSG:900913"),
                units: 'm'
            }),
            layers = this.createLayers(),
            center = this.getCentreOfTheMap(),
            zoom = this.getZoomOfTheMap();

        map.addLayers(layers);

        map.setCenter(new OpenLayers.LonLat(center[0], center[1]), zoom);

        this.map = map;

        return map;
    },

    /**
     *
     */
    createLayers: function() {
        return [new OpenLayers.Layer.WMS( "new terrestris OSM WMS",
                "http://ows2.terrestris.de/geoserver/osm/wms", {layers: 'osm_europe'} )];
    },

    /**
     *
     */
    renderMap: function(mapDivId) {
        this.map.render(mapDivId);
    },

    /**
     *
     */
    recenterMap: function(lonLat) {
        if (this.map != null) {
            this.map.setCenter(lonLat);
        }
    }
});