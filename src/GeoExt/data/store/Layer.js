/**
 * @requires GeoExt/data/model/Layer.js
 */

Ext.define('GeoExt.data.store.Layer', {
    require: ['GeoExt.data.model.Layer'],
    extend: 'Ext.data.Store',
    model: 'GeoExt.data.model.Layer',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
