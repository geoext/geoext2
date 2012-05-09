/**
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/**
 * @requires GeoExt/data/reader/Attribute.js
 */

/**
 * @class GeoExt.data.AttributeModel
 * A specific model, which is fit for the records created by the 
 * {@link GeoExt.data.reader.Attribute}'s readRecords method.
 */
Ext.define('GeoExt.data.AttributeModel', {
    alternateClassName: 'GeoExt.data.AttributeRecord',
    extend: 'Ext.data.Model',
    requires: ['Ext.data.proxy.Ajax', 'GeoExt.data.reader.Attribute'],
    alias: 'model.gx_attribute',
    fields: [
        {name: 'name', mapping: 'name'},
        {name: 'type', mapping: 'type'},
        {name: 'restriction', mapping: 'restriction'},
        {name: 'nillable', type: 'bool', mapping: 'nillable'}
        // No 'value' field by default. 
        // It gets added by the GeoExt.data.reader.Attribute constructor 
        // if it is given a feature.
    ],
    proxy: {
        type: 'ajax',
        url: 'change_me', // should not be not empty or it fails in the tests,
        reader: {
            type: 'gx_attribute'
        }
    }
});