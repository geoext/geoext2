/**
 * @class GeoExt.data.LayerModel
 * @borrows Ext.data.Model
 * 
 *  Class defines a model for records containing an OpenLayers layer object.
 *  Usually this class is not instantiated directly, but referenced by its mtype 'gx_layer' 
 *  or name 'GeoExt.data.model.Layer' as string representation as a config option within creation of a superior component, 
 *  such as a store.
 */
Ext.define('GeoExt.data.LayerModel', {
    extend: 'Ext.data.Model',
    alias: ['gx_layer'],
    fields: [
        {name: 'title', mapping: 'name'},
        {name: 'name', mapping: 'metadata.name'},
        'id'
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

/**
 * Returns the {OpenLayers.Layer} layer object used in this model instance
 */
    getLayer: function() {
        return this.raw;
    }
});

