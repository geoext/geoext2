/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include OpenLayers/Symbolizer/Raster.js
 */

/**
 * @class GeoExt.data.RasterStyleModel
 * <p>A specific model for Raster Symbolizer classifications<p>
 *
 * Preconfigured with an Ajax proxy and a JSON reader
 * 
 */

Ext.define('GeoExt.data.RasterStyleModel',{
        extend: 'Ext.data.Model',
        requires : ['Ext.data.JsonReader'],
        idProperty: "filter",
        fields: [
            {name: "symbolizers", mapping: function(v) {
                return {
                    fillColor: v.color,
                    fillOpacity: v.opacity,
                    stroke: false
                };
            }, defaultValue: null},
            {name: "filter", mapping: "quantity", type: "float", sortType: 'asFloat', sortDir: 'ASC'},
            {name: "label", mapping: function(v) {
                // fill label with quantity if empty
                return v.label || v.quantity;
            }}
        ],
        proxy: {
            type: 'memory',
            reader: {
                type: 'json',
                root: 'colorMap'
            }
        },
        listeners:{
            idchanged:function(rec){
                for(var i=0;i<rec.stores.length;i++){
                    var store = rec.stores[i];
                    store.sort();
                }
            }
        }
});
