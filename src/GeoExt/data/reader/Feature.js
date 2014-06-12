/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include OpenLayers/Feature/Vector.js
 * @requires GeoExt/Version.js
 */

/**
 * Used to read the attributes of a feature.
 *
 * @class GeoExt.data.reader.Feature
 */
Ext.define('GeoExt.data.reader.Feature', {
    extend: 'Ext.data.reader.Json',
    alias : 'reader.feature',
    requires: [
        'GeoExt.Version'
    ],

    createFieldAccessor: function(field){
        var accessor = this.callParent([field]);
        if(!Ext.isDefined(accessor)) {
            // We weren't configured with a field definition that resulted in a
            // possible complex assessor, Let's define one where the field's
            // name is looked up inside of the attribute-object of the
            // OpenLayers feature.
            //
            // An alternative would be to define a mapping prior and then call
            // the parents `createFieldAccessor`-methoid again...
            //
            // var newMapping = 'attributes.' + field.name,
            //     newFieldDef = Ext.apply(field, {mapping: newMapping});
            // accessor = this.callParent([newFieldDef]);
            //
            // ...The above code actually works as well as the line below.
            // Internally the lines above will eventually lead to the code
            // below.
            accessor = this.createAccessor('attributes.' + field.name)
        }
        return accessor;
    },

    /**
     *
     */
    extractRecord: function(feature){
        var featureState = feature && feature.state,
            states = OpenLayers.State,
            // newly inserted features need to be made into phantom records
            id = (featureState === states.INSERT) ? undefined : feature.id,
            record;

        // call the parent which actually also modifies the given feature in
        record = this.callParent(arguments);

        record.state = featureState;
        if (featureState === states.INSERT || featureState === states.UPDATE) {
            // setDirty is marked deprecated without replacement
            // record.setDirty();
            // TODO below line is currently untested
            record.dirty = true;
        }
        // original:
        // convertedValues['id'] = id;
        // TODO below line only partly tested, it currently exposes the same
        // behaviour we had with ExtJS 4
        //
        // we have to store the state of 'dirty' so we can set it back after we
        // have set the id (TODO we might need to change this to instead not use
        // the setter at all)
        var oldDirty = record.dirty
        record.setId(id);
        record.dirty = oldDirty;

        return record;
    },

    /**
     * Force to have our convertRecordData. Only needed for ExtJS 4
     *
     * @private
     */
    buildExtractors: function() {
        this.callParent(arguments);
        if (GeoExt.isExt4) {
            this.convertRecordData = this.convertFeatureRecordData;
        }
    },

    /**
     * Copy feature attribute to record. Only needed for ExtJS 4
     *
     * @param {Array} convertedValues
     * @param {Object} feature
     * @param {Object} record
     * @private
     */
    convertFeatureRecordData: function(convertedValues, feature, record) {
        //<debug>
        if (GeoExt.isExt5) {
            Ext.Error.raise('convertFeatureRecordData should not be called when using ExtJS 5');
        }
        //</debug>
        if (feature) {
            var fields = record.fields;
            var values = {};
            if (feature.attributes) {
                for (var j = 0, jj = fields.length; j < jj; j++){
                    var field = fields.items[j];
                    var v;
                    if (/[\[\.]/.test(field.mapping)) {
                        try {
                            v = new Function("obj", "return obj." + field.mapping)(feature.attributes);
                        } catch(e){
                            v = field.defaultValue;
                        }
                    }
                    else {
                        v = feature.attributes[field.mapping || field.name] || field.defaultValue;
                    }
                    if (field.convert) {
                        v = field.convert(v, record);
                    }
                    convertedValues[field.name] = v;
                }
            }
            record.state = feature.state;
            if (feature.state == OpenLayers.State.INSERT ||
                    feature.state == OpenLayers.State.UPDATE) {
                record.setDirty();
            }

            // newly inserted features need to be made into phantom records
            var id = (feature.state === OpenLayers.State.INSERT) ? undefined : feature.id;
            convertedValues['id'] = id;
        }
    }
});
