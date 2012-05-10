/**
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full text
 * of the license.
 */

/**
 * @class GeoExt.data.WfsCapabilitiesLayerStore
 */
Ext.define('GeoExt.data.WfsCapabilitiesLayerStore',{
    extend: 'Ext.data.Store',
    requires: ['GeoExt.data.reader.WfsCapabilities'],
    model: 'GeoExt.data.WfsCapabilitiesLayerModel',
    alternateClassName: ['GeoExt.data.WFSCapabilitiesStore','GeoExt.data.WfsCapabilitiesStore'],
    /**
     * @cfg {Array[{Object}]}
     * An array of {Ext.data.Field} configuration objects to create additional fields on the
     * {GeoExt.data.WfsCapabilitiesLayerModel} layer records created by this store when parsing a WFS capabilities document
     */
    fields: null,
    config: {
        /**
         * @cfg {String}
         * The URL from which to retrieve the WFS GetCapabilities document
         */
        /**
         * @property {String}
         * The URL from which to retrieve the WFS GetCapabilities document
         */
        url: null
    },
    /**
     * @private
     */
    constructor: function(config){
        var me = this,
        xtraFields = null;
        
        config = Ext.apply({}, config);
        
        if(config.fields){
            //save a ref to the extra fields but delete them from the config
            //since a fields property passed in a config object can cause some
            //unexpected behavior
            xtraFields = config.fields;
            delete config.fields;
        }
        me.callParent([config]);
        
        //post process the extra fields. they will be lost if done before the
        //parent constructor is called
        if(xtraFields){
            var model = me.getModel();
            var modelFields = model.fields;
            for (var i=0; i < xtraFields.length; i++) {
                modelFields.add(new Ext.data.Field(xtraFields[i]));
            }
        }
        config.url && me.setUrl(config.url);
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
