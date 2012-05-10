/**
 * Model for a summit
 */
Ext.define('GX.model.Summit', {
    extend: 'Ext.data.Model',
    fields: [
        {name: 'id', type: 'int'},
        {name: 'name', type: 'string'},
        {name: 'elevation', type: 'int'},
        {name: 'lat', type: 'float'},
        {name: 'lon', type: 'float'}
    ]
});
