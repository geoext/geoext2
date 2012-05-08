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
    alternateClassName: 'GeoExt.data.LayerRecord',
    extend: 'GeoExt.data.AbstractLayer',
    requires: ['Ext.data.proxy.Memory', 'Ext.data.reader.Json'],
    alias: 'gx_layer',
    fields: [
        {name: 'title', mapping: 'name'},
        {name: 'legendURL', mapping: 'metadata.legendURL'},
        {name: 'hideTitle', mapping: 'metadata.hideTitle'},
        'id'
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});

