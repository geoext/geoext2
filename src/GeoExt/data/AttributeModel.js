Ext.define('GeoExt.data.AttributeModel',{
    alternateClassName: 'GeoExt.data.AttributeRecord',
    extend: 'Ext.data.Model',
    requires: ['Ext.data.proxy.Ajax'], // later on: 'GeoExt.data.reader.Attribute'],
    alias: 'model.gx_attribute',
    fields: [
        {name: 'name', mapping: 'name'},
        {name: 'type', mapping: 'type'},
        {name: 'restriction', mapping: 'restriction'},
        {name: 'nillable', type: 'bool', mapping: 'nillable'}
        // not always a 'value' field 
    ],
    proxy: {
        type: 'ajax',
        url: 'change_me' // should not be not empty or it fails in the tests
        // later on:
        /*,
        reader: {
            type: 'gx_attribute'
        }*/
    }
});