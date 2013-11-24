/**
 *
 */
Ext.define('GeoExt.adapter.MapLibLeaflet', {
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
    applyCentreOfTheMap: function(latLng) {
        // GeoExt abstraction for position
        var pos = [latLng.lng, latLng.lat];

        // optional (only implementation logic)
        this.recenterMap(latLng);

        return pos;
    },

    /**
     *
     */
    applyExtentOfTheMap: function(bounds) {
         throw new Error('applyExtentOfTheMap must be implemented for leaflet');
    },

    /**
     *
     */
    applyLayersOfTheMap: function() {
        throw new Error('applyLayersOfTheMap must be implemented for leaflet');
    },

    /**
     *
     */
    applyMapObject: function(lMap) {
        return lMap;
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

        // create a dummy map within a dummy div
        var map = L.map('dummy-leaflet-div'),
            layers = this.createLayers(),
            center = this.getCentreOfTheMap(),
            zoom = this.getZoomOfTheMap();

        layers.addTo(map);

        map.setView([center[0], center[1]], zoom);

        this.map = map;

        return map;
    },

    /**
     *
     */
    createLayers: function() {
        return L.tileLayer.wms("http://ows2.terrestris.de/geoserver/osm/wms", {
            layers: 'osm_europe',
            format: 'image/png',
            transparent: true,
            attribution: "..."
        });
    },

    /**
     *
     */
    renderMap: function(mapDivId) {
        var oldMap = this.map,
            center = this.getCentreOfTheMap(),
            zoom = this.getZoomOfTheMap();

        // delete the old dummy map and create the new one
        // inside our GeoExt.MapPanel instance
        oldMapContainer = document.getElementById('dummy-leaflet-div');
        var mapContainerParent = oldMapContainer.parentNode;
        mapContainerParent.removeChild(oldMapContainer);
        delete oldMap;

        this.map = L.map(mapDivId);
        this.map.addLayer(this.createLayers());
        this.map.setView([center[0], center[1]], zoom);
    },

    /**
     *
     */
    recenterMap: function(latLng) {
        if (this.map != null) {
            this.map.setView(latLng, this.zoom);
        }

    }
});