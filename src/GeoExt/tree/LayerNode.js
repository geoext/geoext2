Ext.define('GeoExt.tree.LayerNode', {
    extend: 'Ext.AbstractPlugin',
    mixins: ['Ext.util.Observable'],
    alias: 'plugin.gx_layer',

    /** api: config[layer]
     *  ``OpenLayers.Layer or String``
     *  The layer that this layer node will
     *  be bound to, or the name of the layer (has to match the layer's
     *  name property). If a layer name is provided, ``layerStore`` also has
     *  to be provided.
     */

    /** api: property[layer]
     *  ``OpenLayers.Layer``
     *  The layer this node is bound to.
     */
    layer: null,
    
    /** api: property[autoDisable]
     *  ``Boolean``
     *  Should this node automattically disable itself when the layer
     *  is out of range and enable itself when the layer is in range.
     *  Defaults to true, unless ``layer`` has ``isBaseLayer``==true
     *  or ``alwaysInRange``==true.
     */
    autoDisable: null,
    
    /** api: config[layerStore]
     *  :class:`GeoExt.data.LayerStore` ``or "auto"``
     *  The layer store containing the layer that this node represents.  If set
     *  to "auto", the node will query the ComponentManager for a
     *  :class:`GeoExt.MapPanel`, take the first one it finds and take its layer
     *  store. This property is only required if ``layer`` is provided as a
     *  string.
     */
    layerStore: null,
    
    /** api: config[checkedGroup]
     *  ``String`` If provided, nodes will be rendered with a radio button
     *  instead of a checkbox. All layers represented by nodes with the same
     *  checkedGroup are considered mutually exclusive - only one can be
     *  visible at a time.
     */
    
    /** api: config[loader]
     *  ``Ext.tree.TreeLoader|Object`` If provided, subnodes will be added to
     *  this LayerNode. Obviously, only loaders that process an
     *  ``OpenLayers.Layer`` or :class:`GeoExt.data.LayerRecord` (like
     *  :class:`GeoExt.tree.LayerParamsLoader`) will actually generate child
     *  nodes here. If provided as ``Object``, a
     *  :class:`GeoExt.tree.LayerParamLoader` instance will be created, with
     *  the provided object as configuration.
     */
    
    /** private: method[constructor]
     *  Private constructor override.
     */
    init: function(target) {
        target.raw.checked = "";
        target.raw.leaf = target.raw.leaf || !target.raw.children;
        
        if(!target.iconCls && !target.children) {
            target.iconCls = "gx-tree-layer-icon";
        }
        
        if (target.text) {
            this.fixedText = true;
        }
    },

    /** private: method[render]
     *  :param bulkRender: ``Boolean``
     */
    render: function(bulkRender) {
        var layer = this.layer instanceof OpenLayers.Layer && this.layer;
        if(!layer) {
            // guess the store if not provided
            if(!this.layerStore || this.layerStore == "auto") {
                this.layerStore = GeoExt.MapPanel.guess().layers;
            }
            // now we try to find the layer by its name in the layer store
            var i = this.layerStore.findBy(function(o) {
                return o.get("title") == this.layer;
            }, this);
            if(i != -1) {
                // if we found the layer, we can assign it and everything
                // will be fine
                layer = this.layerStore.getAt(i).getLayer();
            }
        }
        if (!this.rendered || !layer) {
            var ui = this.getUI();
            
            if(layer) {
                this.layer = layer;
                // no DD and radio buttons for base layers
                if(layer.isBaseLayer) {
                    this.draggable = false;
                    Ext.applyIf(this.attributes, {
                        checkedGroup: "gx_baselayer"
                    });
                }
                
                //base layers & alwaysInRange layers should never be auto-disabled
                this.autoDisable = !(this.autoDisable===false || this.layer.isBaseLayer || this.layer.alwaysInRange);
                
                if(!this.text) {
                    this.text = layer.name;
                }
                
                ui.show();
                this.addVisibilityEventHandlers();
            } else {
                ui.hide();
            }
            
            if(this.layerStore instanceof GeoExt.data.LayerStore) {
                this.addStoreEventHandlers(layer);
            }            
        }
        GeoExt.tree.LayerNode.superclass.render.apply(this, arguments);
    },
    
    /** private: method[addVisibilityHandlers]
     *  Adds handlers that sync the checkbox state with the layer's visibility
     *  state
     */
    addVisibilityEventHandlers: function() {
        this.layer.events.on({
            "visibilitychanged": this.onLayerVisibilityChanged,
            scope: this
        }); 
        this.on({
            "checkchange": this.onCheckChange,
            scope: this
        });
        if(this.autoDisable){
            if (this.layer.map) {
                this.layer.map.events.register("moveend", this, this.onMapMoveend);
            } else {
                this.layer.events.register("added", this, function added() {
                    this.layer.events.unregister("added", this, added);
                    this.layer.map.events.register("moveend", this, this.onMapMoveend);
                });
            }
        }
    },
    
    /** private: method[onLayerVisiilityChanged
     *  handler for visibilitychanged events on the layer
     */
    onLayerVisibilityChanged: function() {
        if(!this._visibilityChanging) {
            this.getUI().toggleCheck(this.layer.getVisibility());
        }
    },
    
    /** private: method[onCheckChange]
     *  :param node: ``GeoExt.tree.LayerNode``
     *  :param checked: ``Boolean``
     *
     *  handler for checkchange events 
     */
    onCheckChange: function(node, checked) {
        if(checked != this.layer.getVisibility()) {
            this._visibilityChanging = true;
            var layer = this.layer;
            if(checked && layer.isBaseLayer && layer.map) {
                layer.map.setBaseLayer(layer);
            } else {
                layer.setVisibility(checked);
            }
            delete this._visibilityChanging;
        }
    },
    
    /** private: method[onMapMoveend]
     *  :param evt: ``OpenLayers.Event``
     *
     *  handler for map moveend events to determine if node should be
     *  disabled or enabled 
     */
    onMapMoveend: function(evt){
        /* scoped to node */
        if (this.autoDisable) {
            if (this.layer.inRange === false) {
                this.disable();
            }
            else {
                this.enable();
            }
        }
    },
    
    /** private: method[addStoreEventHandlers]
     *  Adds handlers that make sure the node disappeares when the layer is
     *  removed from the store, and appears when it is re-added.
     */
    addStoreEventHandlers: function() {
        this.layerStore.on({
            "add": this.onStoreAdd,
            "remove": this.onStoreRemove,
            "update": this.onStoreUpdate,
            scope: this
        });
    },
    
    /** private: method[onStoreAdd]
     *  :param store: ``Ext.data.Store``
     *  :param records: ``Array(Ext.data.Record)``
     *  :param index: ``Number``
     *
     *  handler for add events on the store 
     */
    onStoreAdd: function(store, records, index) {
        var l;
        for(var i=0; i<records.length; ++i) {
            l = records[i].getLayer();
            if(this.layer == l) {
                this.getUI().show();
                break;
            } else if (this.layer == l.name) {
                // layer is a string, which means the node has not yet
                // been rendered because the layer was not found. But
                // now we have the layer and can render.
                this.render();
                break;
            }
        }
    },
    
    /** private: method[onStoreRemove]
     *  :param store: ``Ext.data.Store``
     *  :param record: ``Ext.data.Record``
     *  :param index: ``Number``
     *
     *  handler for remove events on the store 
     */
    onStoreRemove: function(store, record, index) {
        if(this.layer == record.getLayer()) {
            this.getUI().hide();
        }
    },

    /** private: method[onStoreUpdate]
     *  :param store: ``Ext.data.Store``
     *  :param record: ``Ext.data.Record``
     *  :param operation: ``String``
     *  
     *  Listener for the store's update event.
     */
    onStoreUpdate: function(store, record, operation) {
        var layer = record.getLayer();
        if(!this.fixedText && (this.layer == layer && this.text !== layer.name)) {
            this.setText(layer.name);
        }
    },

    /** private: method[destroy]
     */
    destroy: function() {
        var layer = this.layer;
        if (layer instanceof OpenLayers.Layer) {
            if (layer.map) {
                layer.map.events.unregister("moveend", this, this.onMapMoveend);
            }
            layer.events.un({
                "visibilitychanged": this.onLayerVisibilityChanged,
                scope: this
            });
        }
        delete this.layer;
        var layerStore = this.layerStore;
        if(layerStore) {
            layerStore.un("add", this.onStoreAdd, this);
            layerStore.un("remove", this.onStoreRemove, this);
            layerStore.un("update", this.onStoreUpdate, this);
        }
        delete this.layerStore;
        this.un("checkchange", this.onCheckChange, this);

        GeoExt.tree.LayerNode.superclass.destroy.apply(this, arguments);
    }

});