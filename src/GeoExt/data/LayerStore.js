/**
 * @requires GeoExt/data/LayerModel.js
 */

/**
 * @class GeoExt.data.LayerStore
 * A store that synchronizes a layers array of an OpenLayers.Map with a
 * layer store holding {@link GeoExt.data.LayerModel} instances.
 */
Ext.define('GeoExt.data.LayerStore', {
    requires: ['GeoExt.data.LayerModel'],
    extend: 'Ext.data.Store',
    model: 'GeoExt.data.LayerModel',
    
    statics: {
        /**
         * @static
         * @property {Number} MAP_TO_STORE
         */
        MAP_TO_STORE: 1,
        /**
         * @static
         * @property {Number} STORE_TO_MAP
         */
        STORE_TO_MAP: 2 
    },

    /**
     * @event bind
     * Fires when the store is bound to a map.
     *
     * @param {GeoExt.data.LayerStore} store
     * @param {OpenLayers.Map} map
     */
        
    /**
     * @cfg {OpenLayers.Map/GeoExt.panel.Map/Object} map
     * Map that this store will be in sync with. If not provided, the
     * store will not be bound to a map.
     */
        
    /** 
     * @property {OpenLayers.Map/Object} map
     * Map that the store is synchronized with, if any.
     */
    map: null,
        
    /** 
     * @cfg {OpenLayers.Layer/Array} layers
     * Layers that will be added to the store (and the map, depending on the
     * value of the ``initDir`` option.
     */
        
    /** 
     * @cfg {Number} initDir
     * Bitfields specifying the direction to use for the initial sync between
     * the map and the store, if set to 0 then no initial sync is done.
     * Defaults to {@link #MAP_TO_STORE} |
     * {@link #STORE_TO_MAP}.
     */

    /** 
     * @config {Object} Creation parameters
     * @private
     */
    constructor: function(config) {
        var me = this;

        config = Ext.apply({}, config);

        // "map" option
        var map = (GeoExt.MapPanel && config.map instanceof GeoExt.MapPanel) ?
            config.map.map : config.map;
        delete config.map;

        // "layers" option - is an alias to "data" option
        if(config.layers) {
            config.data = config.layers;
        }
        delete config.layers;

        // "initDir" option
        var options = {initDir: config.initDir};
        delete config.initDir;

        me.callParent([config]);

        if(map) {
            this.bind(map, options);
        }
    },

    /**
     * Bind this store to a map instance, once bound the store
     * is synchronized with the map and vice-versa.
     *
     * @param {OpenLayers.Map} map The map instance.
     * @param {Object} options  
     */
    bind: function(map, options) {
        var me = this;

        if(me.map) {
            // already bound
            return;
        }
        me.map = map;
        options = Ext.apply({}, options);

        var initDir = options.initDir;
        if(options.initDir == undefined) {
            initDir = GeoExt.data.LayerStore.MAP_TO_STORE |
                GeoExt.data.LayerStore.STORE_TO_MAP;
        }

        // create a snapshot of the map's layers
        var layers = map.layers.slice(0);

        if(initDir & GeoExt.data.LayerStore.STORE_TO_MAP) {
            me.each(function(record) {
                me.map.addLayer(record.getLayer());
            }, me);
        }
        if(initDir & GeoExt.data.LayerStore.MAP_TO_STORE) {
            me.loadRawData(layers, true);
        }

        map.events.on({
            "changelayer": me.onChangeLayer,
            "addlayer": me.onAddLayer,
            "removelayer": me.onRemoveLayer,
            scope: me
        });
        me.on({
            "load": me.onLoad,
            "clear": me.onClear,
            "add": me.onAdd,
            "remove": me.onRemove,
            "update": me.onUpdate,
            scope: me
        });
        me.data.on({
            "replace" : me.onReplace,
            scope: me
        });
        me.fireEvent("bind", me, map);
    },

    /**
     * Unbind this store from the map it is currently bound.
     */
    unbind: function() {
        var me = this;

        if(me.map) {
            me.map.events.un({
                "changelayer": me.onChangeLayer,
                "addlayer": me.onAddLayer,
                "removelayer": me.onRemoveLayer,
                scope: me
            });
            me.un("load", me.onLoad, me);
            me.un("clear", me.onClear, me);
            me.un("add", me.onAdd, me);
            me.un("remove", me.onRemove, me);

            me.data.un("replace", me.onReplace, me);

            me.map = null;
        }
    },
        
        /**
         * Handler for layer changes.  When layer order changes, this moves the
         * appropriate record within the store.
         * @private
         * @param {Object} evt
         */
        onChangeLayer: function(evt) {
            var layer = evt.layer;
            var recordIndex = this.findBy(function(rec, id) {
                return rec.getLayer() === layer;
            });
            if(recordIndex > -1) {
                var record = this.getAt(recordIndex);
                if(evt.property === "order") {
                    if(!this._adding && !this._removing) {
                        var layerIndex = this.map.getLayerIndex(layer);
                        if(layerIndex !== recordIndex) {
                            this._removing = true;
                            this.remove(record);
                            delete this._removing;
                            this._adding = true;
                            this.insert(layerIndex, [record]);
                            delete this._adding;
                        }
                    }
                } else if(evt.property === "name") {
                    record.set("title", layer.name);
                } else {
                    this.fireEvent("update", this, record, Ext.data.Record.EDIT);
                }
            }
        },
       
        /**
         * Handler for a map's addlayer event
         * @private
         * @param {Object} evt
         */
        onAddLayer: function(evt) {
            var me = this;
            if(!me._adding) {
                me._adding = true;
                var result  = me.proxy.reader.read(evt.layer);
                me.add(result.records);
                delete me._adding;
            }
        },
        
        /**
         * Handler for a map's removelayer event
         * @private
         * @param {Object} evt
         */
        onRemoveLayer: function(evt){
            //TODO replace the check for undloadDestroy with a listener for the
            // map's beforedestroy event, doing unbind(). This can be done as soon
            // as http://trac.openlayers.org/ticket/2136 is fixed.
            if(this.map.unloadDestroy) {
                if(!this._removing) {
                    var layer = evt.layer;
                    this._removing = true;
                    this.remove(this.getByLayer(layer));
                    delete this._removing;
                }
            } else {
                this.unbind();
            }
        },
        
        /**
         * Handler for a store's load event
         * @private
         * @param {Ext.data.Store} store
         * @param {Ext.data.Model[]} records
         * @param {Object} options
         */
        onLoad: function(store, records, options) {
            if (!Ext.isArray(records)) {
                records = [records];
            }
            if (options && !options.add) {
                this._removing = true;
                for (var i = this.map.layers.length - 1; i >= 0; i--) {
                    this.map.removeLayer(this.map.layers[i]);
                }
                delete this._removing;

                // layers has already been added to map on "add" event
                var len = records.length;
                if (len > 0) {
                    var layers = new Array(len);
                    for (var j = 0; j < len; j++) {
                        layers[j] = records[j].getLayer();
                    }
                    this._adding = true;
                    this.map.addLayers(layers);
                    delete this._adding;
                }
            }
        },
        
        /**
         * Handler for a store's clear event
         * @private
         * @param {Ext.data.Store} store
         */
        onClear: function(store) {
            this._removing = true;
            for (var i = this.map.layers.length - 1; i >= 0; i--) {
                this.map.removeLayer(this.map.layers[i]);
            }
            delete this._removing;
        },
        
        /**
         * Handler for a store's add event
         * @private
         * @param {Ext.data.Store} store
         * @param {Ext.data.Model[]} records
         * @param {Number} index
         */
        onAdd: function(store, records, index) {
            if(!this._adding) {
                this._adding = true;
                var layer;
                for(var i=records.length-1; i>=0; --i) {
                    layer = records[i].getLayer();
                    this.map.addLayer(layer);
                    if(index !== this.map.layers.length-1) {
                        this.map.setLayerIndex(layer, index);
                    }
                }
                delete this._adding;
            }
        },
        
        /**
         * Handler for a store's remove event
         * @private
         * @param {Ext.data.Store} store
         * @param {Ext.data.Model} record
         * @param {Number} index
         */
        onRemove: function(store, record, index){
            if(!this._removing) {
                var layer = record.getLayer();
                if (this.map.getLayer(layer.id) != null) {
                    this._removing = true;
                    this.removeMapLayer(record);
                    delete this._removing;
                }
            }
        },
        
        /**
         * Handler for a store's update event
         * @private
         * @param {Ext.data.Store} store
         * @param {Ext.data.Model} record
         * @param {Number} operation
         */
        onUpdate: function(store, record, operation) {
            if(operation === Ext.data.Record.EDIT) {
                if (record.modified && record.modified.title) {
                    var layer = record.getLayer();
                    var title = record.get("title");
                    if(title !== layer.name) {
                        layer.setName(title);
                    }
                }
            }
        },

        /**
         * Removes a record's layer from the bound map.
         * @private
         * @param {Ext.data.Record} record
         */
        removeMapLayer: function(record){
            this.map.removeLayer(record.getLayer());
        },

        /**
         * Handler for a store's data collections' replace event
         * @private
         * @param {String} key
         * @param {Ext.data.Model} oldRecord In this case, a record that has
         *     been replaced.
         * @param {Ext.data.Model} newRecord In this case, a record that is
         *     replacing oldRecord.
         */
        onReplace: function(key, oldRecord, newRecord){
            this.removeMapLayer(oldRecord);
        },
        
        /**
         * Get the record for the specified layer
         * @param {OpenLayers.Layer} layer
         * @returns {Ext.data.Model} or undefined if not found
         */
        getByLayer: function(layer) {
            var index = this.findBy(function(r) {
                return r.getLayer() === layer;
            });
            if(index > -1) {
                return this.getAt(index);
            }
        },
        
        /**
         * @private
         */
        destroy: function() {
            var me = this;
            me.unbind();
            me.callParent();
        }
});
