Ext.define('GeoExt.data.store.Layer', {
    extend: 'Ext.data.Store',
    model: 'gx_layer',
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
