/**
 * Model for a summit
 */
Ext.define('CF.model.Summit', {
    extend: 'Ext.data.Model',
    fields: [
        {
            name: 'symbolizer',
            convert: function(v, r) {
                // record.raw a OpenLayers.Feature.Vector instance
                return r.get('layer').styleMap.createSymbolizer(r.data, 'default');
            }
        },
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
            name: 'lat',
            convert: function(value, record) {
                // record.data is a OpenLayers.Feature.Vector instance
                if (record.data instanceof OpenLayers.Feature.Vector &&
                        record.get('geometry') instanceof OpenLayers.Geometry.Point) {
                    return record.get('geometry').y;
                } else {
                    return "This is not a Feature or geometry is wrong type";
                }
            }
        },
        {
            name: 'lon',
            convert: function(value, record) {
                // record.data is a OpenLayers.Feature.Vector instance
                if (record.data instanceof OpenLayers.Feature.Vector &&
                        record.get('geometry') instanceof OpenLayers.Geometry.Point) {
                    return record.get('geometry').x;
                } else {
                    return "This is not a Feature or geometry is wrong type";
                }
            }
        }
    ]
});
