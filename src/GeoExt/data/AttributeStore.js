/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/*
 * @requires GeoExt/data/AttributeModel.js
 */

/**
 * <p>An Attribute Store.
 * TODO: port the original AttributeStore's bind method + callbacks to this new one.</p>
 */
Ext.define('GeoExt.data.AttributeStore', {
    extend: 'Ext.data.Store',
    requires: ['GeoExt.data.AttributeModel', 'Ext.data.Field'],
    model: 'GeoExt.data.AttributeModel',

    config: {
        /**
         * @cfg {String}
         * The URL from which to retrieve the WFS DescribeFeatureType document.
         */
        url: null,

        /**
         * @cfg {Object} format
         * The Ext.Format passed to the reader. 
         */
        format: null,
        
        /**
         * @cfg {Object} ignore
         * The ignore object passed to the reader.
         */
        ignore: null,
        
        /**
         * @cfg {Object} feature
         * The OpenLayers.Feature.Vector passed to the reader.
         */
        feature: null
    },

    /**
     * @private
     */
    constructor: function(config) {
        // At this point, we have to copy the complex objects from the config
        // into the prototype. This is because Ext.data.Store's constructor 
        // creates deep copies of these objects.
        if (config.feature) {
            this.feature = config.feature;
            delete config.feature;
        }
        if (config.format) {
            this.format = config.format;
            delete config.format;
        }

        this.callParent([config]);

        if (this.ignore) {
            this.setIgnore(this.ignore);
            delete this.ignore;
        }
        if (this.url) {
            this.setUrl(this.url);
            delete this.url;
        }
        if (this.feature) {
            this.setFeature(this.feature);
            delete this.feature;
        }
        if (this.format) {
            this.setFormat(this.format);
            delete this.format;
        }
    },

    /**
     * @private
     * We're setting the proxy URL.
     * @param {String} url
     */
    applyUrl: function(url) {
        this.getProxy().url = url;
    },

    /**
     * @private
     * We're setting the proxy URL.
     * @param {OpenLayers.Feature} feature
     */
    applyFeature: function(feature) {
        this.getProxy().getReader().setFeature(feature);
    },

    /**
     * @private
     * We're setting the ignore property in the reader.
     * @param {Object} ignore
     */
    applyIgnore: function(ignore) {
        this.getProxy().getReader().setIgnore(ignore);
    },

    /**
     * @private
     * We're setting the format property in the reader.
     * @param {OpenLayers.Format} format
     */
    applyFormat: function(format) {
        this.getProxy().getReader().setFormat(format);
    }
});
