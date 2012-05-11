/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full text
 * of the license.
 */

/**
 * @class GeoExt.data.WmsCapabilitiesLayerStore
 *
 * Small helper class to make creating stores for remote WMS layer data
 * easier. The store is pre-configured with a built-in
 * {Ext.data.proxy.Ajax} and {GeoExt.data.reader.WmsCapabilities}.
 * The proxy is configured to allow caching and issues requests via GET.
 * If you require some other proxy/reader combination then you'll have to
 * configure this with your own proxy.
 */
Ext.define('GeoExt.data.WmsCapabilitiesLayerStore',{
    extend: 'Ext.data.Store',
    requires: ['GeoExt.data.reader.WmsCapabilities'],
    model: 'GeoExt.data.WmsCapabilitiesLayerModel',
    alternateClassName: ['GeoExt.data.WMSCapabilitiesStore','GeoExt.data.WmsCapabilitiesStore'],

    config: {
        /**
         * @cfg {String} url
         * The URL from which to retrieve the WMS GetCapabilities document
         */
        /**
         * @property {String} url
         * The URL from which to retrieve the WMS GetCapabilities document
         */
        url: null
    },
    /**
     * @private
     */
    constructor: function(config){
        var me = this;
        me.callParent([config]);

        if(config.url) { me.setUrl(config.url); }
    },
    /**
     * @private
     */
    applyUrl: function(newValue){
        if(newValue && Ext.isString(newValue)){
            this.getProxy().url = newValue;
        }
    }
});
