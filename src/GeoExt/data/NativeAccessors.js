/**
 * A base model for use by models which are mapped to objects which may contain native
 * getters and setters for certain model fields. This mixin passes model field value
 * changes down to the bound object when a native setter is available and gets the
 * field value via the bound object's native getter method when available.
 * 
 * NOTE: MUST be included as a mixin to a model object to work correctly.
 * NOT designed to be instantiated and used directly
 */
Ext.define('GeoExt.data.NativeAccessors', {
    extend: 'Ext.data.Model',

    /**
     * Called when different value(s) are successfully set on a record
     * @params {Array[{String}]} an array of the field names whose values have changed
     * @private
     */
    afterEdit : function(fields) {
        var nativeObj = this.raw;
        for(var i = 0, len = fields.length; i < len; i++) {
            var field = fields[i];
            var nativeFunc = this.findNativeAccessor('set', field);
            if(nativeFunc) {
                nativeFunc.call(nativeObj, this.data[field]);
            }
        }
        this.callParent([fields]);
    },
 
    //inherit docs
    get : function(field) {
        var val, nativeObj = this.raw;
        var nativeFunc = this.findNativeAccessor('get', field);
        if(nativeFunc) {
            val = nativeFunc.call(nativeObj, this.data.field);
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
    findNativeAccessor : function(operation, property) {
        var nativeObj = this.raw;
        var nativeProp = (this.fields.get(property) && this.fields.get(property).mapping) || property;
        var nativeFunc = nativeObj[operation + nativeProp[0].toUpperCase() + nativeProp.slice(1)];
        return nativeFunc;
    }
});
