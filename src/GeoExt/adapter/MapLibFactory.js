Ext.define('GeoExt.adapter.MapLibFactory', {
    extend: 'Ext.Base',
    requires: [
        'GeoExt.Version',
        'GeoExt.adapter.MapLibLeaflet',
        'GeoExt.adapter.MapLibOpenLayers2'
    ],

    statics: {
        create: function() {
            var mapLibAdapter = null;
            if (typeof L != "undefined") { 
                mapLibAdapter = Ext.create('GeoExt.adapter.MapLibLeaflet');
            } else if (typeof OpenLayers != "undefined") {
                mapLibAdapter = Ext.create('GeoExt.adapter.MapLibOpenLayers2');
            }
            return mapLibAdapter;
        }
    }
});