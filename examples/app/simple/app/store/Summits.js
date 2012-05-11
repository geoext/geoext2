/**
 * The store used for summits
 */
Ext.define('GX.store.Summits', {
    extend: 'GeoExt.data.FeatureStore',
    model: 'GX.model.Summit',
    autoLoad: false
});
