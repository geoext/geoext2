Ext.define('GeoExt.data.AbstractLayer',{
    extend: 'Ext.data.Model',
    fields: [   
                {name: 'opacity',     type: 'float'},
                {name: 'zIndex',      type: 'int'},
                {name: 'isBaseLayer', type: 'bool'},
                {name: 'visibility',  type: 'bool'},
                {name: 'attribution', type: 'string'},
                'params'
            ],
    /**
     * Returns the {OpenLayers.Layer} layer object used in this model instance
     */
    getLayer: function() {
        return this.raw;
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
            'visibiltychanged':function(evt){
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
        var nativeFunc = this.findNativeAccessor('get',field);
        if(nativeFunc){
            nativeFunc(this.data.field);
        } else {
            //no native getter, so just use the normal model get function
            //Ext.data.Model doesn't contain post processing code, so don't callParent otherwise
            this.callParent([field]);
        }
    },
    /**
     * @private
     */
    findNativeAccessor: function(operation,property){
        var nativeProp = this.fields.get(property) || property;
        var nativeFunc = layer[operation+nativeProp[0].toUpperCase()+nativeProp.slice(1)];
        return nativeFunc | null;
    }
});