Ext.define('GeoExt.data.LayerModel',{
    alternateClassName: 'GeoExt.data.LayerRecord',
    extend: 'Ext.data.Model',
    requires: ['Ext.data.proxy.Memory', 'Ext.data.reader.Json'],
    alias: 'model.gx_layer',
    fields: [   
        'id',
        {name: 'title', type: 'string', mapping: 'name'},
        {name: 'legendURL', type: 'string', mapping: 'metadata.legendURL'},
        {name: 'hideTitle', type: 'bool', mapping: 'metadata.hideTitle'},
        {name: 'hideInLegend', type: 'bool', mapping: 'metadata.hideInLegend'}
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