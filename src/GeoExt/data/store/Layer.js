Ext.define('GeoExt.data.store.Layer', {
    extend: 'Ext.data.Store',
    model: 'GeoExt.data.model.Layer',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
