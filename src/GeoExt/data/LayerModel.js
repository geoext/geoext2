/**
 * @class GeoExt.data.LayerModel
 * The layer model class used by {GeoExt.data.LayerStore} and its subclasses.
 *  Defines a model for records containing an OpenLayers layer object.
 *  Usually this class is not instantiated directly, but referenced by its mtype 'gx_layer' 
 *  or name 'GeoExt.data.model.Layer' as string representation as a config option within creation of a superior component, 
 *  such as a store.
 * @borrows Ext.data.Model
 */
Ext.define('GeoExt.data.LayerModel',{
    alternateClassName: 'GeoExt.data.LayerRecord',
    extend: 'Ext.data.Model',
    requires: ['Ext.data.proxy.Memory', 'Ext.data.reader.Json'],
    alias: 'model.gx_layer',
    statics: {
        /**
         * Convenience function for creating new layer model instance object
         * using a layer object.
         * @param {OpenLayers.Layer} layer
         * @return {GeoExt.data.LayerModel} 
         * @static         
         */
        createFromLayer: function(layer) {
            return this.proxy.reader.readRecords([layer]).records[0];
        }
    },
    fields: [   
        'id',
        {name: 'title',        type: 'string', mapping: 'name'},
        {name: 'legendURL',    type: 'string', mapping: 'metadata.legendURL'},
        {name: 'hideTitle',    type: 'bool',   mapping: 'metadata.hideTitle'},
        {name: 'hideInLegend', type: 'bool',   mapping: 'metadata.hideInLegend'},
        {name: 'opacity',      type: 'float'},
        {name: 'zIndex',       type: 'int'},       
        {name: 'isBaseLayer',  type: 'bool'}, 
        {name: 'visibility',   type: 'bool'},     
        {name: 'attribution',  type: 'string'}
    ],
    proxy: {
        type: 'memory',
        reader: {
            type: 'json'
        }
    },

    /**
     * @private
     */
    constructor: function(data, id, raw, convertedData) {
        var me = this,
            layer = raw;
        me.callParent(arguments);
        //attach listeners to layer properties modification events      
        layer.events.on({
            'visibilitychanged':function(evt){
                var visiblity = evt.object.getVisibility();
                this[this.persistenceProperty]['visibility'] = visibility;
                Ext.Array.include(this.modified,'visibility');
                this.dirty = true;
                this.callStore('afterEdit', this.modified);
            },
            scope: this
        });
    },
    
    /**
     * Returns the {OpenLayers.Layer} layer object used in this model instance
     */
    getLayer: function() {
        return this.raw;
    },
    
   /**
    * @private
    */
    updateField: function(rawProperty,value){
        //these properties either are handled elsewhere or apply to the collection
        var ignoreProperties = ['visibility', 'order'];
        if(ignoreProperties.indexOf(rawProperty)==-1){
            var field = this.fields.get(rawProperty);
            if(!field){
                //property name is not a field, look for a mapping
                this.fields.each(function(fieldObj){
                    if(fieldObj.mapping == rawProperty){
                        field = fieldObj;
                        return false; //stop processing
                    }
                }, this);
            }
            field && this.set(field.name,value);
        }
    },
    
    
    /**
     * @private
     */    
    afterEdit: function(fields){
        var layer = this.raw;
        for(var i=0,len=fields.length;i<len;i++){
            var field = fields[i];
            var nativeFunc = this.findNativeAccessor('set',field);
            if(nativeFunc){
                nativeFunc(this.data.field);
            }
        }
        this.callParent([fields]);
    },
    
    //inherit docs
    get: function(field){
        var val;
        var nativeFunc = this.findNativeAccessor('get',field.name || field);
        if(nativeFunc){
            val = nativeFunc(this.data.field);
        } else {
            //no native getter, so just use the normal model get function
            //Ext.data.Model doesn't contain post processing code, so don't callParent otherwise
            val = this.callParent([field]);
        }
        return val;
    },
    /**
     * @private
     */
    findNativeAccessor: function(operation,property){
        var layer = this.raw;
        var nativeProp = (this.fields.get(property) && this.fields.get(property).mapping) || property;
        var nativeFunc = layer[operation+nativeProp[0].toUpperCase()+nativeProp.slice(1)];
        return nativeFunc | null;
    }
});