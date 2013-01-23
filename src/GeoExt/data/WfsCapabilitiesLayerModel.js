/*
 * Copyright (c) 2008-2013 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include GeoExt/data/reader/WfsCapabilities.js
 */

/**
 * @class GeoExt.data.WfsCapabilitiesLayerModel
 * The model for WFS layers coming from a WFS GetCapabilities document.
 */
Ext.define('GeoExt.data.WfsCapabilitiesLayerModel',{
    extend: 'GeoExt.data.LayerModel',
    alternateClassName: [
        'GeoExt.data.WFSCapabilitiesModel',
        'GeoExt.data.WfsCapabilitiesModel'
    ],
    requires: ['GeoExt.data.reader.WfsCapabilities'],
    alias: 'model.gx_wfscapabilities',
    fields: [
        {name: "name", type: "string", mapping: "metadata.name"},
        {name: "namespace", type: "string", mapping: "metadata.featureNS"},
        {name: "abstract", type: "string", mapping: "metadata.abstract"}
    ],
    proxy: {
        type: 'ajax',
        reader: {
            type: 'gx_wfscapabilities'
        }
    }
});
