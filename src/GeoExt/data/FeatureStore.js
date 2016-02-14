/*
 * Copyright (c) 2008-present The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include OpenLayers/Feature/Vector.js
 * @requires GeoExt/data/reader/Feature.js
 */

/**
 * A store that synchronizes a features array of an `OpenLayers.Layer.Vector`.
 *
 * @class GeoExt.data.FeatureStore
 */
Ext.define('GeoExt.data.FeatureStore', {
    extend: 'Ext.data.Store',
    requires: [
        'GeoExt.data.reader.Feature'
    ],

    statics: {
        /**
         * @static
         * @property {Number} LAYER_TO_STORE
         * Bitfield specifying the layer to store sync direction.
         */
        LAYER_TO_STORE: 1,
        /**
         * @static
         * @property {Number} STORE_TO_LAYER
         * Bitfield specifying the store to layer sync direction.
         */
        STORE_TO_LAYER: 2
    },

    /**
     * Fires when the store is bound to a layer.
     *
     * @event bind
     * @param {GeoExt.data.FeatureStore} store
     * @param {OpenLayers.Layer.Vector} layer
     */

    /**
     * True when the vector layer is binded.
     *
     * @private
     * @property {OpenLayers.Layer.Vector}
     */
    isLayerBinded: false,

    /**
     * Layer that this store will be in sync with. If not provided, the
     * store will not be bound to a layer.
     *
     * @cfg {OpenLayers.Layer.Vector} layer
     */

    /**
     * Vector layer that the store is synchronized with, if any.
     *
     * @property {OpenLayers.Layer.Vector} layer
     */
    layer: null,

    /**
     * @cfg {OpenLayers.Layer/Array} features
     * Features that will be added to the store (and the layer, depending on the
     * value of the `initDir` option.
     */

    /**
     * @cfg {Number} initDir
     * Bitfields specifying the direction to use for the initial sync between
     * the layer and the store, if set to 0 then no initial sync is done.
     * Defaults to `GeoExt.data.FeatureStore.LAYER_TO_STORE|GeoExt.data.FeatureStore.STORE_TO_LAYER`
     */

    /**
     * @cfg {OpenLayers.Filter} featureFilter
     * This filter is evaluated before a feature record is added to the store.
     */
    featureFilter: null,

    /**
     * @param {Object} config Creation parameters
     * @private
     */
    constructor: function(config) {
        config = Ext.apply({
            proxy: {
                type: 'memory',
                reader: {
                    type: 'feature',
                    idProperty: 'id'
                }
            }
        }, config);

        if (config.layer) {
            this.layer = config.layer;
            delete config.layer;
        }

        // features option. Alias to data option
        if (config.features) {
            config.data = config.features;
        }
        delete config.features;

        this.callParent([config]);

        var options = {initDir: config.initDir};
        delete config.initDir;

        if (this.layer) {
            this.bind(this.layer, options);
        }
    },

    /**
     * Unbinds own listeners by calling #unbind when being destroyed.
     *
     * @private
     */
    destroy: function() {
        this.unbind();
        this.callParent();
    },

    /**
     * Bind this store to a layer instance. Once bound the store
     * is synchronized with the layer and vice-versa.
     *
     * @param {OpenLayers.Layer.Vector} layer The layer instance.
     * @param {Object} options
     */
    bind: function(layer, options) {
        options = options || {};

        if (this.isLayerBinded) {
            // already bound
            return;
        }
        this.layer = layer;
        this.isLayerBinded = true;

        var initDir = options.initDir;
        if (options.initDir == undefined) {
            initDir = GeoExt.data.FeatureStore.LAYER_TO_STORE |
                GeoExt.data.FeatureStore.STORE_TO_LAYER;
        }

        var features = layer.features.slice(0);
        var featureKey = GeoExt.isExt4 ? 'raw' : 'data';

        if (initDir & GeoExt.data.FeatureStore.STORE_TO_LAYER) {
            this.each(function(record) {
                layer.addFeatures([record[featureKey]]);
            }, this);
        }

        if (initDir & GeoExt.data.FeatureStore.LAYER_TO_STORE &&
                layer.features.length > 0) {
            // append a snapshot of the layer's features
            this.loadRawData(features, true);
        }

        this.layer.events.on({
            'featuresadded': this.onFeaturesAdded,
            'featuresremoved': this.onFeaturesRemoved,
            'featuremodified': this.onFeatureModified,
            scope: this
        });
        this.on({
            'load': this.onLoad,
            'clear': this.onClear,
            'add': this.onAdd,
            'remove': this.onRemove,
            'update': this.onStoreUpdate,
            scope: this
        });

        this.fireEvent("bind", this, this.layer);
    },

    /**
     * Unbind this store from his layer instance.
     */
    unbind: function() {
        if (this.isLayerBinded) {
            this.layer.events.un({
                'featuresadded': this.onFeaturesAdded,
                'featuresremoved': this.onFeaturesRemoved,
                'featuremodified': this.onFeatureModified,
                scope: this
            });
            this.un({
                'load': this.onLoad,
                'clear': this.onClear,
                'add': this.onAdd,
                'remove': this.onRemove,
                'update': this.onStoreUpdate,
                scope: this
            });
            this.layer = null;
            this.isLayerBinded = false;
        }
    },

    /**
     * Convenience method to add features.
     *
     * @param {OpenLayers.Feature.Vector[]} features The features to add.
     */
    addFeatures: function(features) {
        return this.loadRawData(features, true);
    },

    /**
     * Convenience method to remove features.
     *
     * @param {OpenLayers.Feature.Vector[]} features The features to remove.
     */
    removeFeatures: function(features) {
        //accept both a single-argument array of records, or any number of record arguments
        if (!Ext.isArray(features)) {
            features = Array.prototype.slice.apply(arguments);
        } else {
            // Create an array copy
            features = features.slice(0);
        }
        var recs = [];
        Ext.Array.each(features, function(feature) {
            var rec = this.getByFeature(feature);
            recs.push(rec);
        }, this);
        this.remove(recs);
    },

    /**
     * Returns the record corresponding to a feature.
     *
     * @param {OpenLayers.Feature} feature An OpenLayers.Feature.Vector object.
     * @return {String} The model instance corresponding to a feature.
     */
    getByFeature: function(feature) {
        var featureKey = GeoExt.isExt4 ? 'raw' : 'data',
            comparisonFunc = function(record, id) {
                return record[featureKey] == feature;
            },
            idx = this.findBy(comparisonFunc),
            rec = this.getAt(idx);
        return rec;
    },

    /**
     * Returns the record corresponding to a feature id.
     *
     * @param {String} id An OpenLayers.Feature.Vector id string.
     * @return {String} The model instance corresponding to the given id.
     */
    getById: function(id) {
        var featureKey = GeoExt.isExt4 ? 'raw' : 'data';
        return (this.snapshot || this.data).findBy(function(record) {
            return record[featureKey].id === id;
        });
    },

    /**
     * Adds the given records to the associated layer.
     *
     * @param {Ext.data.Model[]} records
     * @private
     */
    addFeaturesToLayer: function(records) {
        var features = [],
            featureKey = GeoExt.isExt4 ? 'raw' : 'data';
        for (var i = 0, len = records.length; i < len; i++) {
            features.push(records[i][featureKey]);
        }
        this._adding = true;
        this.layer.addFeatures(features);
        delete this._adding;
    },

    /**
     * Handler for layer featuresadded event.
     *
     * @param {Object} evt
     * @private
     */
    onFeaturesAdded: function(evt) {
        if (!this._adding) {
            var features = evt.features,
                toAdd = features;
            if (this.featureFilter) {
                toAdd = [];
                for (var i = 0, len = features.length; i < len; i++) {
                    var feature = features[i];
                    if (this.featureFilter.evaluate(feature) !== false) {
                        toAdd.push(feature);
                    }
                }
            }
            toAdd = this.proxy.reader.read(toAdd).records;
            this._adding = true;
            this.add(toAdd);
            delete this._adding;
        }
    },

    /**
     * Handler for layer featuresremoved event.
     *
     * @param {Object} evt
     * @private
     */
    onFeaturesRemoved: function(evt) {
        if (!this._removing) {
            var features = evt.features;
            for (var i = features.length - 1; i >= 0; i--) {
                var record = this.getByFeature(features[i]);
                if (record) {
                    this._removing = true;
                    this.remove(record);
                    delete this._removing;
                }
            }
        }
    },

    /**
     * Handler for layer featuremodified event.
     *
     * @param {Object} evt
     * @private
     */
    onFeatureModified: function(evt) {
        var record_old = this.getByFeature(evt.feature);
        if (record_old) {
            var record_new = this.proxy.reader.read(evt.feature).records[0];
            var keysAndValues = {};

            if (GeoExt.isExt4) {
                keysAndValues = record_new.getData();
            } else {
                var keys = Ext.Object.getKeys(record_new.getFieldsMap());
                Ext.each(keys, function(key) {
                    keysAndValues[key] = record_new.get(key);
                });
            }
            Ext.Object.each(keysAndValues, function(key, value) {
                record_old.set(key, value, {commit: true});
            }, this);
            // Setting record dirty now:
            //
            // This was previously handled by set-call above, but since Ext5
            // the model instance keeps a reference to the original feature
            // inside of 'data' and the setter then thinks no changhes have
            // occured, as the new value of the record is already the same as
            // the one of the referenced feature.
            //
            // TODO check if the above assumption is always right
            record_old.dirty = true;
        }
    },

    /**
     * Handler for a store's load event.
     *
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model[]} records
     * @param {Boolean} successful
     * @private
     */
    onLoad: function(store, records, successful) {
        if (successful) {
            this._removing = true;
            this.layer.removeAllFeatures();
            delete this._removing;

            this.addFeaturesToLayer(records);
        }
    },

    /**
     * Handler for a store's clear event.
     *
     * @param {Ext.data.Store} store
     * @private
     */
    onClear: function(store) {
        this._removing = true;
        this.layer.removeFeatures(this.layer.features);
        delete this._removing;
    },

    /**
     * Handler for a store's add event.
     *
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model[]} records
     * @param {Number} index
     * @private
     */
    onAdd: function(store, records, index) {
        if (!this._adding) {
            // addFeaturesToLayer takes care of setting
            // this._adding to true and deleting it
            this.addFeaturesToLayer(records);
        }
    },

    /**
     * Handler for a store's remove event. Depending on the ExtJS version this
     * method will either receive a single record or an array of records.
     *
     * @param {Ext.data.Store} store The FeatureStore.
     * @param {Ext.data.Model/Ext.data.Model[]} records A single record in
     *     ExtJS 4 and an array of records in ExtJS 5.
     * @param {Number} index The index at which the record(s) were removed.
     * @private
     */
    onRemove: function(store, records, index) {
        var me = this,
            featureKey = GeoExt.isExt4 ? 'raw' : 'data',
            layer = me.layer,
            removeFeatures = [];

        if (!Ext.isArray(records)) {
            records = [records];
        }
        if (!me._removing) {
            Ext.each(records, function(record){
                var feature = record[featureKey];
                if (layer.getFeatureById(feature.id) != null) {
                    removeFeatures.push(feature);
                }
            });
            if (removeFeatures.length > 0) {
                me._removing = true;
                layer.removeFeatures(removeFeatures);
                delete me._removing;
            }
        }
    },

    /**
     * Handler for a store's update event.
     *
     * @param {Ext.data.Store} store
     * @param {Ext.data.Model} record
     * @param {Number} operation
     * @param {Array} modifiedFieldNames
     *
     * @private
     */
    onStoreUpdate: function(store, record, operation, modifiedFieldNames) {
        if (!this._updating) {
            var featureKey = GeoExt.isExt4 ? 'raw' : 'data',
                feature = record[featureKey];
            if (feature.state !== OpenLayers.State.INSERT) {
                feature.state = OpenLayers.State.UPDATE;
            }
            var cont = this.layer.events.triggerEvent('beforefeaturemodified', {
                feature: feature
            });
            if (cont !== false) {
                Ext.Array.each(modifiedFieldNames, function(field) {
                    feature.attributes[field] = record.get(field);
                });
                this._updating = true;
                this.layer.events.triggerEvent('featuremodified', {
                    feature: feature
                });
                delete this._updating;
            }
        }
    },

    /**
     * @inheritdoc
     *
     * The event firing behaviour of Ext.4.1 is reestablished here. See also:
     * [This discussion on the Sencha forum](http://www.sencha.com/forum/
     * showthread.php?253596-beforeload-is-not-fired-by-loadRawData)
     *
     * In version 4.2.1 this method reads
     *
     *     //...
     *     loadRawData : function(data, append) {
     *         var me      = this,
     *             result  = me.proxy.reader.read(data),
     *             records = result.records;
     *
     *         if (result.success) {
     *             me.totalCount = result.total;
     *             me.loadRecords(records, append ? me.addRecordsOptions : undefined);
     *         }
     *     },
     *     // ...
     *
     * While the previous version 4.1.3 has also
     * the line `me.fireEvent('load', me, records, true);`:
     *
     *     // ...
     *     if (result.success) {
     *         me.totalCount = result.total;
     *         me.loadRecords(records, append ? me.addRecordsOptions : undefined);
     *         me.fireEvent('load', me, records, true);
     *     }
     *     // ...
     *
     * Our overwritten method has the code from 4.1.3, so that the #load-event
     * is being fired.
     *
     * See also the source code of [version 4.1.3](http://docs-origin.sencha.
     * com/extjs/4.1.3/source/Store.html#Ext-data-Store-method-loadRawData) and
     * of [version 4.2.1](http://docs-origin.sencha.com/extjs/4.2.1/source/
     * Store.html#Ext-data-Store-method-loadRawData).
     *
     * Since version 5.0.0 the method has changed at even more places so that
     * we check GeoExt.isExt4 to decide which method we should patch. TODO: We
     * should remove the dependency on the load event as this patching really
     * gets nasty.
     */
    loadRawData : function(data, append) {
        // The contents of the respective branches match their base library
        // counterpart. The only difference is `me.fireEvent` in case of success
        if (GeoExt.isExt4) {
            var me      = this,
                result  = me.proxy.reader.read(data),
                records = result.records;

            if (result.success) {
                me.totalCount = result.total;
                me.loadRecords(records, append ? me.addRecordsOptions : undefined);
                me.fireEvent('load', me, records, true);
            }
        } else {
            var me      = this,
                session = me.getSession(),
                result  = me.getProxy().getReader().read(data, session ? {
                    recordCreator: session.recordCreator
                } : undefined),
                records = result.getRecords(),
                success = result.getSuccess();

            if (success) {
                me.totalCount = result.getTotal();
                me.loadRecords(records, append ? me.addRecordsOptions : undefined);
                me.fireEvent('load', me, records, true);
            }
            return success;
        }
    }
});
