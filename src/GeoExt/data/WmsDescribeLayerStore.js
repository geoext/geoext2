/**
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full text
 * of the license.
 */

/**
 * @class GeoExt.data.WmsDescribeLayerStore
 * Small helper class to make creating stores for remote WMS layer description
 * easier. The store is pre-configured with a built-in
 * {Ext.data.proxy.Ajax} and {GeoExt.data.reader.WmsDescribeLayer}.
 * The proxy is configured to allow caching and issues requests via GET.
 * If you require some other proxy/reader combination then you'll have to
 * configure this with your own proxy.
 */
Ext.define('GeoExt.data.WmsDescribeLayerStore',{
    extend: 'Ext.data.Store',
    requires: ['GeoExt.data.reader.WmsDescribeLayer'],
    model: 'GeoExt.data.WmsDescribeLayerModel',
    alternateClassName: ['GeoExt.data.WMSDescribeLayerStore'],

    config: {
        /**
         * @cfg {String}
         * The URL from which to retrieve the WMS DescribeLayer document
         */
        url: null,

        /**
         * @cfg {OpenLayers.Format}
         * A parser for transforming the XHR response into an array of objects
         * representing attributes. Defaults to an {OpenLayers.Format.WMSDescribeLayer}
         * parser.
         */
        format: null
    },

    /**
     * @private
     */
    constructor: function(config){
        var me = this;
        me.callParent([config]);

        if (config.url) { 
            me.setUrl(config.url); 
        }
        if (config.format) {
            me.setFormat(config.format);
        }
    },

    /**
     * @private
     */
    applyUrl: function(newValue){
        if(newValue && Ext.isString(newValue)){
            this.getProxy().url = newValue;
        }
    },

    /**
     * @private
     */
    applyFormat: function(newFormat) {
        this.getProxy().reader.format = newFormat;
    }

});
