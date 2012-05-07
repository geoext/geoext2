/**
 * @requires GeoExt/data/LayerModel.js
 */

Ext.define('GeoExt.data.LayerStore', {
    require: ['GeoExt.data.LayerModel'],
    extend: 'Ext.data.Store',
    model: 'GeoExt.data.LayerModel',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
