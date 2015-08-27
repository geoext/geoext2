/**
 * The store used for summits
 */
Ext.define('CF.store.Summits', {
    extend: 'GeoExt.data.FeatureStore',
    model: 'CF.model.Summit',
    autoLoad: false,

    listeners: {
        load: function(store, records) {
            // do custom stuff on summits load if you want, for example here we
            // zoom to summits extent
            var dataExtent = store.layer.getDataExtent();
            if (dataExtent) {
                store.layer.map.zoomToExtent(dataExtent);
            }
        }
    }
});
