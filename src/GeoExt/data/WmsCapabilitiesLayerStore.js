Ext.define('GeoExt.data.WmsCapabilitiesLayerStore',{
    extend: 'Ext.data.Store',
    model: 'GeoExt.data.WmsCapabilitiesLayerModel',
    alternateClassName: ['GeoExt.data.WMSCapabilitiesStore','GeoExt.data.WmsCapabilitiesStore'],
    /**
     * @cfg {Array[{Object}]}
     * An array of {Ext.data.Field} configuration objects to create additional fields on the
     * {GeoExt.data.WmsCapabilitiesLayerModel} layer records created by this store when parsing a WMS capabilities document
     */
    fields: null,
    config: {
        /**
         * @cfg {String}
         * The URL from which to retrieve the WMS GetCapabilities document
         */
        /**
         * @property {String}
         * The URL from which to retrieve the WMS GetCapabilities document
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
        
        if(config.url){
            config.proxy = Ext.applyIf(config.proxy || {},
                {url: config.url}
            );
        }
        if(config.fields){
            //save a ref to the extra fields but delete them from the config
            //since a fields property passed in a config object can cause some
            //unexpected behavior
            xtraFields = config.fields;
            delete conifg.fields;
        }
        me.callParent([config]);
        
        //post process the extra fields. they will be lost if done before the
        //parent constructor is called
        if(xtraFields){
            me.model.addFields(xtraFields);
        }
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
