/**
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/**
 * @requires GeoExt/data/AttributeModel.js
 */

/**
 * @class GeoExt.data.AttributeStore
 * <p>An Attribute Store.
 * TODO: port the original AttributeStore's bind method + callbacks to this new one.</p>
 */
Ext.define('GeoExt.data.AttributeStore', {
    extend: 'Ext.data.Store',
    requires: ['GeoExt.data.AttributeModel', 'Ext.data.Field'],
    model: 'GeoExt.data.AttributeModel',

    /**
     * @cfg {Array[{Object}]}
     * An array of {Ext.data.Field} configuration objects to create additional
     * fields on the {@link GeoExt.data.AttributeModel} instances created by
     * this store when parsing a WFS DescribeFeatureType document.
     */
    fields: null,

    config: {
        /**
         * @cfg {String}
         * The URL from which to retrieve the WFS DescribeFeatureType document
         */
        /**
         * @property {String}
         * The URL from which to retrieve the WFS DescribeFeatureType document
         */
        url: null
    },

    /**
     * @private
     */
    constructor: function(config) {
        var me = this,
            xtraFields = null,
            ignore, url;

        config = Ext.apply({}, config);

        if (config.ignore) {
            ignore = config.ignore;
            delete config.ignore;
        }
        if (config.url) {
            url = config.url;
            delete config.url;
        }
        if (config.fields) {
            //save a ref to the extra fields but delete them from the config
            //since a fields property passed in a config object can cause some
            //unexpected behavior
            xtraFields = config.fields;
            delete config.fields;
        }

        me.callParent([config]);

        //post process the extra fields. they will be lost if done before the
        //parent constructor is called
        if (xtraFields) {
            var model = me.getProxy().model,
                modelFields = model.prototype.fields;
            for (var i=0; i < xtraFields.length; i++) {
                modelFields.add(
                    Ext.create('Ext.data.Field', xtraFields[i])
                );
            }
        }

        // pass on the ignore property (what about format ?) to the reader
        if (ignore) {
            me.getProxy().getReader().ignore = ignore;
        }
        if (url) {
            me.setUrl(url);
        }
    },

    /**
     * @private
     * We're setting the proxy URL
     * @param {String} newValue The new proxy URL
     */
    applyUrl: function(newValue) {
        if (newValue && Ext.isString(newValue)) {
            this.getProxy().url = newValue;
        }
        // no return value, since Ext.data.Store has no url property
    }
});
