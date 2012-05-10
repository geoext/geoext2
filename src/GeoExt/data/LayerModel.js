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
    extend: 'GeoExt.data.NativeAccessors',
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
                var visibile = evt.object.getVisibility();
                this[this.persistenceProperty].visibility = visibile;
                this.modified.visibility = visibile;
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
        if(ignoreProperties.indexOf(rawProperty) < 0){
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
    }
});