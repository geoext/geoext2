/*
 * Copyright (c) 2008-2011 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/*
 * @require OpenLayers/Format/WFSDescribeFeatureType.js
 */

/**
 * A reader to create model objects from a DescribeFeatureType structure. Uses
 * `OpenLayers.Format.WFSDescribeFeatureType` internally for the parsing.
 *
 * Example:
<pre><code>
Ext.define('My.model.Model', {
    field: ['name', 'type'],
    proxy: {
        type: 'ajax',
        url: 'http://wftgetfeaturetype',
        reader: {
            type: 'gx_attribute'
        }
    }
});
</code></pre> 
 * `gx_attribute` is the alias to the Attribute reader.
 *
 * 
 */

Ext.define('GeoExt.data.reader.Attribute', {
    extend: 'Ext.data.reader.Json',
    requires: ['Ext.data.Field'],
    alternateClassName: 'GeoExt.data.AttributeReader',
    alias: 'reader.gx_attribute',

    config: {
        /**
         * @cfg {OpenLayers.Format} format
         * A parser for transforming the XHR response
         * into an array of objects representing attributes.  Defaults to
         * `OpenLayers.Format.WFSDescribeFeatureType` parser.
         */
        format: null,

        /**
         * @cfg {Object} ignore
         * Properties of the ignore object should be field names.
         * Values are either arrays or regular expressions.
         */
        ignore: null,

        /**
         * @cfg {OpenLayers.Feature.Vector} feature
         * A vector feature. If provided records created by the reader will
         * include a field named "value" referencing the attribute value as
         * set in the feature.
         */
        feature: null
    },
    
    /**
     * Create a new reader.
     * @param {Object} config (optional) Config object.
     */
    constructor: function(config) {
        this.callParent([config]);
        
        this.setFormat(this.format || new OpenLayers.Format.WFSDescribeFeatureType());
        
        if (this.feature) {
            this.setFeature(this.feature);
        }
    },
    
    applyFeature: function(feature) {
        var f = Ext.create('Ext.data.Field', {
            name: "value",
            defaultValue: undefined // defaultValue defaults to ""
                                    // in Ext.data.Field, we may 
                                    // need to change that...
        });
        this.model.prototype.fields.add(f);
        return feature;
    },

    /** 
     * Function called by the parent to deserialize a DescribeFeatureType
     * response into Model objects.
     * @param {Object} request The XHR object that contains the
     * DescribeFeatureType response.
     */
    getResponseData: function(request) {
        var data = request.responseXML;
        if(!data || !data.documentElement) {
            data = request.responseText;
        }
        return this.readRecords(data);
    },

    /**
     * Function called by {@link #read} to do the actual deserialization.
     * @param {DOMElement/String/Array} data A document element or XHR
     * response string.  As an alternative to fetching attributes data from
     * a remote source, an array of attribute objects can be provided given
     * that the properties of each attribute object map to a provided field
     * name.
     */
    readRecords: function(data) {
        var attributes;
        if(data instanceof Array) {
            attributes = data;
        } else {
            // only works with one featureType in the doc
            attributes = this.format.read(data).featureTypes[0].properties;
        }
        var feature = this.feature;
        var fields = this.model.prototype.fields;
        var numFields = fields.length;
        var attr, values, name, record, ignore, value, field, records = [];
        for(var i=0, len=attributes.length; i<len; ++i) {
            ignore = false;
            attr = attributes[i];
            values = {};
            for(var j=0; j<numFields; ++j) {
                field = fields.items[j];
                name = field.name;
                value = attr[name];
                if(this.ignoreAttribute(name, value)) {
                    ignore = true;
                    break;
                }
                values[name] = value;
            }
            if(feature) {
                value = feature.attributes[values.name];
                if(value !== undefined) {
                    if(this.ignoreAttribute("value", value)) {
                        ignore = true;
                    } else {
                        values.value = value;
                    }
                }
            }
            if(!ignore) {
                records[records.length] = values;
            }
        }
        return this.callParent([records]);
    },

    /** 
     * Determine if the attribute should be ignored.
     * @param {String} name The field name.
     * @param {String} value The field value.
     * @return {Boolean} True if the attribute should be ignored.
     */
    ignoreAttribute: function(name, value) {
        var ignore = false;
        if(this.ignore && this.ignore[name]) {
            var matches = this.ignore[name];
            if(typeof matches == "string") {
                ignore = (matches === value);
            } else if(matches instanceof Array) {
                ignore = (matches.indexOf(value) > -1);
            } else if(matches instanceof RegExp) {
                ignore = (matches.test(value));
            }
        }
        return ignore;
    }
});
