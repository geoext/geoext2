/*
 * Copyright (c) 2008-present The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @requires GeoExt/Version.js
 * @include OpenLayers/Format/WFSDescribeFeatureType.js
 */

/**
 * A reader to create model objects from a DescribeFeatureType structure. Uses
 * `OpenLayers.Format.WFSDescribeFeatureType` internally for the parsing.
 *
 * Example:
 *
 *     Ext.define('My.model.Model', {
 *         field: ['name', 'type'],
 *         proxy: {
 *             type: 'ajax',
 *             url: 'http://wftgetfeaturetype',
 *             reader: {
 *                 type: 'gx_attribute'
 *             }
 *         }
 *     });
 *
 * `gx_attribute` is the alias to the Attribute reader.
 *
 * @class GeoExt.data.reader.Attribute
 */
Ext.define('GeoExt.data.reader.Attribute', {
    extend: 'Ext.data.reader.Json',
    requires: [
        'GeoExt.Version',
        'Ext.data.Field'
    ],
    alternateClassName: 'GeoExt.data.AttributeReader',
    alias: 'reader.gx_attribute',
    /**
     * Should we keep the raw parsed result? If true, the result will be stored
     * under the #raw property. Default is false.
     * @cfg {Boolean}
     */
    keepRaw: false,
    /**
     * The raw parsed result, only set if #keepRaw is true. When using ExtJS5 a
     * reference to the raw data is always available via the property #data.
     *
     * @cfg {Object}
     */
    raw: null,
    config: {
        /**
         * A parser for transforming the XHR response into an array of objects
         * representing attributes.
         *
         * Defaults to `OpenLayers.Format.WFSDescribeFeatureType` parser.
         *
         * @cfg {OpenLayers.Format}
         */
        format: null,

        /**
         * Properties of the ignore object should be field names. Values are
         * either arrays or regular expressions.
         *
         * @cfg {Object}
         */
        ignore: null,

        /**
         * A vector feature. If provided records created by the reader will
         * include a field named "value" referencing the attribute value as
         * set in the feature.
         *
         * @cfg {OpenLayers.Feature.Vector}
         */
        feature: null
    },

    /**
     * Create a new reader.
     *
     * @param {Object} [config] Config object.
     */
    constructor: function(config) {
        if(config.model){
            this.setModel(config.model)
        } else{
            this.setModel('GeoExt.data.AttributeModel');
        }

        this.initConfig(config);
        this.callParent([config]);

        if (GeoExt.isExt4 && this.feature) {
            this.setFeature(this.feature);
        }
    },

    /**
     * We need to override this as the OpenLayers classes passed as configs
     * loose their class-nature and seem to be copied by ExtJS somewhere.
     *
     * We deal with this elsewhere in a different manner and should see if
     * we can either share code or get rid of this special handling all
     * together. The problem isn't reproducible for other 'classes' with a
     * similar inheritance strategy as OpenLayers 2 has.
     *
     * TODO Find a way to have this functionality shared or get rid of it.
     *
     * @param {Object} config the configuration as passed by the user.
     */
    initConfig: function(config){
        var me = this,
            cfg = config || {},
            prefix = me.$configPrefixed ? '_' : '',
            olConfigs = [
                'format',
                'feature'
            ];
        Ext.each(olConfigs, function(olConfig){
            if (cfg[olConfig]) {
                me[prefix + olConfig] = cfg[olConfig];
                delete cfg[olConfig];
            }
        });
        me.callParent([cfg]);
    },

    /**
     * @private
     */
    destroyReader: function() {
        var me = this;
        delete me.raw;
        this.callParent();
    },

    /**
     * Appends an Ext.data.Field to this #model.
     */
    applyFeature: function(feature) {
        var f = Ext.create('Ext.data.Field', {
            name: "value",
            defaultValue: undefined // defaultValue defaults to ""
                                    // in Ext.data.Field, we may
                                    // need to change that...
        });
        var model = this.model,
            fields;
        if (this.getModel) {
            // ExtJS 5 needs the getter
            model = this.getModel();
        }
        fields = model.prototype.fields;
        if (Ext.isArray(fields)) {
            // In ExtJS 5, fields isn't a collection anymore
            model.addFields([f]);
        } else {
            model.prototype.fields.add(f);
        }
        return feature;
    },

    /**
     * Function called by the parent to deserialize a DescribeFeatureType
     * response into Model objects.
     *
     * @param {Object} request The XHR object that contains the
     *     DescribeFeatureType response.
     */
    getResponseData: function(request) {
        var data = request.responseXML;
        if(!data || !data.documentElement) {
            data = request.responseText;
        }
        return this.readRecords(data);
    },

    /**
     * Function called by
     * {@link Ext.data.reader.Reader#read Ext.data.reader.Reader's read method}
     * to do the actual deserialization.
     *
     * @param {DOMElement/String/Array} data A document element or XHR
     *     response string.  As an alternative to fetching attributes data from
     *     a remote source, an array of attribute objects can be provided given
     *     that the properties of each attribute object map to a provided field
     *     name.
     */
    readRecords: function(data) {
        if (data instanceof Ext.data.ResultSet) {
            // we get into the readRecords method twice,
            // called by Ext.data.reader.Reader#read:
            // check if we already did our work in a previous run
            return data;
        }
        if (!this.getFormat()) {
            this.setFormat(new OpenLayers.Format.WFSDescribeFeatureType());
        }
        var attributes;
        if(data instanceof Array) {
            attributes = data;
        } else {
            // only works with one featureType in the doc
            var result = this.getFormat().read(data);
            if (this.keepRaw) {
                this.raw = result;
            }
            attributes = result.featureTypes[0].properties;
        }
        var feature = this.feature || this.getFeature();
        var model = this.model;
        if (this.getModel) {
            // ExtJS 5 needs the getter
            model = this.getModel();
        }
        var fields = model.prototype.fields;
        var numFields = fields.length;
        var attr, values, name, record, ignore, value, field, records = [];
        for(var i=0, len=attributes.length; i<len; ++i) {
            ignore = false;
            attr = attributes[i];
            values = {};
            for(var j=0; j<numFields; ++j) {
                if (Ext.isArray(fields)) {
                    field = fields[j];
                } else {
                    field = fields.items[j];
                }

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
     *
     * @param {String} name The field name.
     * @param {String} value The field value.
     * @return {Boolean} True if the attribute should be ignored.
     */
    ignoreAttribute: function(name, value) {
        var ignore = false,
            myIgnore = GeoExt.isExt4 ? this.ignore : this.getIgnore();

        if(myIgnore && myIgnore[name]) {
            var matches = myIgnore[name];
            if(typeof matches == "string") {
                ignore = (matches === value);
            } else if(matches instanceof Array) {
                ignore = (Ext.Array.indexOf(matches, value) > -1);
            } else if(matches instanceof RegExp) {
                ignore = (matches.test(value));
            }
        }
        return ignore;
    }
});
