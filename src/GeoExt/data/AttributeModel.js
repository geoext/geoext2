/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/*
 * @requires GeoExt/data/reader/Attribute.js
 */

/**
 * <p>A specific model, which is fit for the records created by the 
 * {@link GeoExt.data.reader.Attribute}'s readRecords method.</p>
 */
(function() {

// This func is used as the convert function for the auto fields. This
// is to work around a Ext bug that prevents subclassing a model that
// has auto fields.
function identity(v) {
    return v;
}

Ext.define('GeoExt.data.AttributeModel', {
    alternateClassName: 'GeoExt.data.AttributeRecord',
    extend: 'Ext.data.Model',
    requires: ['Ext.data.proxy.Ajax', 'GeoExt.data.reader.Attribute'],
    alias: 'model.gx_attribute',
    fields: [
        {name: 'name', type: 'string'},
        {name: 'type', convert: identity},
        {name: 'restriction', convert: identity},
        {name: 'nillable', type: 'bool'}
        // No 'value' field by default. The 'value' field gets added by the 
        // GeoExt.data.reader.Attribute constructor if it is given a feature.
    ],
    proxy: {
        type: 'ajax',
        reader: {
            type: 'gx_attribute'
        }
    }
});

})();
