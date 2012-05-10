/**
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full text
 * of the license.
 */

/**
 * @class GeoExt.data.WmsDescribeLayerModel
 * The model for the structure returned by SLD WMS DescribeLayer.
 */
Ext.define('GeoExt.data.WmsDescribeLayerModel',{
    extend: 'Ext.data.Model',
    requires: ['Ext.data.proxy.Memory', 'Ext.data.reader.Json'],
    alias: 'model.gx_wmsdescribelayer',
    fields: [   
        {name: "owsType", type: "string"},
        {name: "owsURL", type: "string"},
        {name: "typeName", type: "string"}
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    }
});
