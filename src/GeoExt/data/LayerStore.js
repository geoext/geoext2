/**
 * @requires GeoExt/data/LayerModel.js
 */

/**
 * @class GeoExt.data.LayerStore
 */
Ext.define('GeoExt.data.LayerStore', {
    requires: ['GeoExt.data.LayerModel'],
    extend: 'Ext.data.Store',
    model: 'GeoExt.data.LayerModel'
});
