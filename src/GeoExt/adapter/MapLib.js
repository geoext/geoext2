/**
 *
 */
Ext.define('GeoExt.adapter.MapLib', {
    extend: 'Ext.Base',
    requires: [
        'GeoExt.Version'
    ],

    config: {
        centreOfTheMap: null,

        extentOfTheMap: null,

        layersOfTheMap: null,

        mapObject: null,

        zoomOfTheMap: null

    },

    /**
     *
     */
    applyCentreOfTheMap: function(position) {
        throw new Error('applyCentreOfTheMap must be implemented');
    },

    /**
     *
     */
    applyExtentOfTheMap: function() {
        throw new Error('applyExtentOfTheMap must be implemented');
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
    applyMapObject: function() {
        throw new Error('applyMapObject must be implemented');
    },

    /**
     *
     */
    applyZoomOfTheMap: function() {
        throw new Error('applyZoomOfTheMap must be implemented');
    },

    /**
     *
     */
    createMap: function() {
        throw new Error('createMap must be implemented');
    },

    /**
     *
     */
    createLayers: function() {
        throw new Error('createLayers must be implemented');
    },

    /**
     *
     */
    renderMap: function(mapDivId) {
        throw new Error('renderMap must be implemented');
    },

    /**
     *
     */
    recenterMap: function(position) {
        throw new Error('recenterMap must be implemented');
    }

});