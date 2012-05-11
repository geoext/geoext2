/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full text
 * of the license.
 */

/*
 * @include OpenLayers/Format/CQL.js
 */

/**
 * @class GeoExt.data.VectorStyleModel
 * <p>A specific model for CQL Style Rules<p>
 *
 * Preconfigured with an Ajax proxy and a JSON reader
 */

Ext.define('GeoExt.data.VectorStyleModel', {
    extend : 'Ext.data.Model',
    requires : ['Ext.data.JsonReader'],
    fields : [
        {name: "elseFilter", defaultValue: null},
        {name: "symbolizers", defaultValue: null}, 
        {name : "label", mapping : "title" },
        {name: "filter", convertor: function(filter){
            if (typeof filter === "string") {
                filter = filter ? OpenLayers.Format.CQL.prototype.read(filter) : null;
            }
            return filter;}
        }, 
        "name", 
        "description", 
        "minScaleDenominator", 
        "maxScaleDenominator"
    ],
    proxy : {
        type : 'memory',
        reader : {
            type : 'json',
            root : "rules"
        }
    }
});