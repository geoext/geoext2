/**
 * Model for a summit
 */
Ext.define('GX.model.Summit', {
    extend: 'Ext.data.Model',
    fields: [
        {
            name: 'fid',
            convert: function(value, record) {
                // record.raw a OpenLayers.Feature.Vector instance
                if (record.raw instanceof OpenLayers.Feature.Vector) {
                    return record.raw.fid;
                } else {
                    return "This is not a Feature";
                }
            }
        },
        {
            name: 'title',
            convert: function(value, record) {
                return record.get("name") + " - " + record.get("elevation");
            }
        },
        {name: 'name', type: 'string'},
        {name: 'elevation', type: 'int'},
        {
            name: 'position',
            convert: function(value, record) {
                // record.raw a OpenLayers.Feature.Vector instance
                if (record.raw instanceof OpenLayers.Feature.Vector) {
                    return record.raw.geometry.toString();
                } else {
                    return "This is not a Feature";
                }
            }
        }
    ]
});
