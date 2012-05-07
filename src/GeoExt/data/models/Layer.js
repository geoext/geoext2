Ext.define('gx_layer', {
    extend: 'Ext.data.Model',
    fields: [
        'name',
        'id'
    ],
    getLayer: function() {
        return this.raw;
    }
});

