/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @requires GeoExt/Version.js
 */

/**
 * The layer model class used by the stores.
 *
 * @class GeoExt.data.LayerModel
 */
Ext.define('GeoExt.data.LayerModel',{
    alternateClassName: 'GeoExt.data.LayerRecord',
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.proxy.Memory',
        'Ext.data.reader.Json',
        'GeoExt.Version'
    ],
    alias: 'model.gx_layer',
    inheritableStatics: {
        /**
         * Convenience function for creating new layer model instance object
         * using a layer object.
         *
         * @param {ol.layer.Layer} layer
         * @return {GeoExt.data.LayerModel}
         * @static
         */
        createFromLayer: function(layer) {
            return this.getProxy().reader.readRecords([layer]).records[0];
        }
    },
    fields: [
        {name: 'title', type: 'string', convert: function(v, record) { return record.dirty ? v : record.getLayer().get('title'); }},
        {name: 'legendURL', type: 'string', convert: function(v, record) { return record.dirty ? v : record.getLayer().get('legendUrl'); }},
        {name: 'hideTitle', type: 'bool', convert: function(v, record) { return record.dirty ? v : record.getLayer().get('hideTitle'); }}, 
        {name: 'hideInLegend', type: 'bool', convert: function(v, record) { return record.dirty ? v : record.getLayer().get('hideInLegend'); }} 
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },
    /**
     * Returns the {ol.layer.Layer} layer object used in this model instance.
     *
     * @return {ol.layer.Layer}
     */
    getLayer: function() {
        return this.raw;
    }
});
