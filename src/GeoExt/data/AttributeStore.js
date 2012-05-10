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
 * A store to work with DescribeFeatureType responses. This is a regular
 * Ext store preconfigured with a {@link GeoExt.data.AttributeModel}.
 *
 *
 * Example:
<pre><code>
Ext.create('GeoExt.data.AttributeStore', {
    ignore: {type: 'xsd:string'},
    url: 'http://host.wfsdescribefeaturetype'
});
</code></pre>
 */
Ext.define('GeoExt.data.AttributeStore', {
    extend: 'Ext.data.Store',
    requires: ['GeoExt.data.AttributeModel'],
    model: 'GeoExt.data.AttributeModel',

    config: {
        /**
         * @cfg {String}
         * The URL from which to retrieve the WFS DescribeFeatureType document.
         */
        url: null,

        /**
         * @cfg {Object}
         * The `OpenLayers.Format` passed to the reader. See
         * {@link GeoExt.data.reader.Attribute}.
         */
        format: null,
        
        /**
         * @cfg {Object}
         * The ignore object passed to the reader. See
         * {@link GeoExt.data.reader.Attribute}.
         */
        ignore: null
    },

    /**
     * @private
     */
    constructor: function(config) {
        // At this point, we have to copy the complex objects from the config
        // into the prototype. This is because Ext.data.Store's constructor 
        // creates deep copies of these objects.
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
        if (this.format) {
            this.setFormat(this.format);
            delete this.format;
        }
    },

    /**
     * We're setting the proxy URL.
     * @param {String} url
     * @private
     */
    applyUrl: function(url) {
        this.getProxy().url = url;
    },

    /**
     * We're setting the ignore property in the reader.
     * @param {Object} ignore
     * @private
     */
    applyIgnore: function(ignore) {
        this.getProxy().getReader().setIgnore(ignore);
    },

    /**
     * We're setting the format property in the reader.
     * @param {OpenLayers.Format} format
     * @private
     */
    applyFormat: function(format) {
        this.getProxy().getReader().setFormat(format);
    }
});
