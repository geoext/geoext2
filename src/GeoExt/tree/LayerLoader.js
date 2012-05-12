/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full text
 * of the license.
 */

/*
 * @include GeoExt/panel/Map.js
 * @include GeoExt/tree/LayerNode.js
 * @include GeoExt/tree/LayerContainer.js
 */

/**
 * @class
 * A loader that will load all layers of a GeoExt.data.LayerStore.
 * By default, only layers that have displayInLayerSwitcher set to true will be
 * included. The childrens' iconCls defaults to "gx-tree-layer-icon".
 */
Ext.define('GeoExt.tree.LayerLoader', {
    extend: 'Ext.util.Observable',
    requires: [
        'GeoExt.panel.Map', 
        'GeoExt.tree.LayerNode', 
        'GeoExt.tree.LayerContainer'
    ],

    /**
     * Triggered before loading children. Return false to avoid
     * loading children.
     * @event beforeload
     * @param {GeoExt.tree.LayerLoader} this loader
     * @param {Ext.data.NodeInterface} the node that this loader is configured
     *     with
     */

    /**
     * Triggered after children were loaded.
     * @event load
     * @param {GeoExt.tree.LayerLoader} this loader
     * @param {Ext.data.NodeInterface} the node that this loader is configured
     *     with
     */

    /** api: config[store]
     *  :class:`GeoExt.data.LayerStore`
     *  The layer store containing layers to be added by this loader.
     */
    store: null,
    
    /**
     * A function, called in the scope of this loader, with a layer record
     * as argument. Is expected to return true for layers to be loaded, false
     * otherwise. By default, the filter checks for displayInLayerSwitcher:
     * @param {Function} filter
     *  
     * @example
     * filter: function(record) {
     *     return record.getLayer().displayInLayerSwitcher == true
     * }
     */
    filter: function(record) {
        return record.getLayer().displayInLayerSwitcher == true;
    },
    
    /** api: config[baseAttrs]
     *  An object containing attributes to be added to all nodes created by
     *  this loader.
     */
    baseAttrs: null,
    
    /** private: method[load]
     *  :param node: ``Ext.tree.TreeNode`` The node to add children to.
     *  :param callback: ``Function``
     */
    load: function(node, callback) {
        if(this.fireEvent("beforeload", this, node)) {
            this.removeStoreHandlers();
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
            
            if(!this.store) {
                this.store = GeoExt.MapPanel.guess().layers;
            }
            this.store.each(function(record) {
                this.addLayerNode(node, record);
            }, this);
            this.addStoreHandlers(node);
    
            if(typeof callback == "function"){
                callback();
            }
            
            this.fireEvent("load", this, node);
        }
    },
    
    /** private: method[onStoreAdd]
     *  :param store: ``Ext.data.Store``
     *  :param records: ``Array(Ext.data.Record)``
     *  :param index: ``Number``
     *  :param node: ``Ext.tree.TreeNode``
     *  
     *  Listener for the store's add event.
     */
    onStoreAdd: function(store, records, index, node) {
        if(!this._reordering) {
            var nodeIndex = node.get('container').recordIndexToNodeIndex(index+records.length-1, node);
            for(var i=0; i<records.length; ++i) {
                this.addLayerNode(node, records[i], nodeIndex);
            }
        }
    },
    
    /** private: method[onStoreRemove]
     *  :param store: ``Ext.data.Store``
     *  :param record: ``Ext.data.Record``
     *  :param index: ``Number``
     *  :param node: ``Ext.tree.TreeNode``
     *  
     *  Listener for the store's remove event.
     */
    onStoreRemove: function(layerRecord, node) {
        if(!this._reordering) {
            this.removeLayerNode(node, layerRecord);
        }
    },

    /** private: method[addLayerNode]
     *  :param node: ``Ext.tree.TreeNode`` The node that the layer node will
     *      be added to as child.
     *  :param layerRecord: ``Ext.data.Record`` The layer record containing the
     *      layer to be added.
     *  :param index: ``Number`` Optional index for the new layer.  Default is 0.
     *  
     *  Adds a child node representing a layer of the map
     */
    addLayerNode: function(node, layerRecord, index) {
        index = index || 0;
        if (this.filter(layerRecord) === true) {
            var layer = layerRecord.getLayer();
            var child = this.createNode({
                plugins: [{
                    ptype: 'gx_layer',
                }],
                layer: layer,
                text: layer.name,
                listeners: {
                    move: this.onChildMove,
                    scope: this
                }
            });
            var sibling = node.childNodes && node.getChildAt(index);
            if(sibling) {
                node.insertChild(index, child);
            } else {
                node.appendChild(child);
            }
        }
    },

    /** private: method[removeLayerNode]
     *  :param node: ``Ext.tree.TreeNode`` The node that the layer node will
     *      be removed from as child.
     *  :param layerRecord: ``Ext.data.Record`` The layer record containing the
     *      layer to be removed.
     * 
     *  Removes a child node representing a layer of the map
     */
    removeLayerNode: function(node, layerRecord) {
        if (this.filter(layerRecord) === true) {
            var child = node.findChildBy(function(node) {
                return node.get('layer') == layerRecord.getLayer();
            });
            if(child) {
                child.un("move", this.onChildMove, this);
                child.remove();
            }
        }
    },
    
    /** private: method[onChildMove]
     *  :param tree: ``Ext.data.Tree``
     *  :param node: ``Ext.tree.TreeNode``
     *  :param oldParent: ``Ext.tree.TreeNode``
     *  :param newParent: ``Ext.tree.TreeNode``
     *  :param index: ``Number``
     *  
     *  Listener for child node "move" events.  This updates the order of
     *  records in the store based on new node order if the node has not
     *  changed parents.
     */
    onChildMove: function(tree, node, oldParent, newParent, index) {
        this._reordering = true;
        // remove the record and re-insert it at the correct index
        var record = this.store.getByLayer(node.get('layer'));

        if(newParent instanceof GeoExt.tree.LayerContainer && 
                                    this.store === newParent.loader.store) {
            newParent.loader._reordering = true;
            this.store.remove(record);
            var newRecordIndex;
            if(newParent.childNodes.length > 1) {
                // find index by neighboring node in the same container
                var searchIndex = (index === 0) ? index + 1 : index - 1;
                newRecordIndex = this.store.findBy(function(r) {
                    return newParent.childNodes[searchIndex].layer === r.getLayer();
                });
                index === 0 && newRecordIndex++;
            } else if(oldParent.parentNode === newParent.parentNode){
                // find index by last node of a container above
                var prev = newParent;
                do {
                    prev = prev.previousSibling;
                } while (prev && !(prev instanceof GeoExt.tree.LayerContainer && prev.lastChild));
                if(prev) {
                    newRecordIndex = this.store.findBy(function(r) {
                        return prev.lastChild.layer === r.getLayer();
                    });
                } else {
                    // find indext by first node of a container below
                    var next = newParent;
                    do {
                        next = next.nextSibling;
                    } while (next && !(next instanceof GeoExt.tree.LayerContainer && next.firstChild));
                    if(next) {
                        newRecordIndex = this.store.findBy(function(r) {
                            return next.firstChild.layer === r.getLayer();
                        });
                    }
                    newRecordIndex++;
                }
            }
            if(newRecordIndex !== undefined) {
                this.store.insert(newRecordIndex, [record]);
            } else {
                this.store.insert(oldRecordIndex, [record]);
            }
            delete newParent.loader._reordering;
        }
        delete this._reordering;
    },
    
    /** private: method[addStoreHandlers]
     *  :param node: :class:`GeoExt.tree.LayerNode`
     */
    addStoreHandlers: function(node) {
        if(!this._storeHandlers) {
            this._storeHandlers = {
                "add": function(store, layerRecords, index) {
                    this.onStoreAdd(store, layerRecords, index, node);
                },
                "remove": function(parent, removedRecord) {
                    this.onStoreRemove(removedRecord, node);
                }
            };
            for(var evt in this._storeHandlers) {
                this.store.on(evt, this._storeHandlers[evt], this);
            }
        }
    },
    
    /** private: method[removeStoreHandlers]
     */
    removeStoreHandlers: function() {
        if(this._storeHandlers) {
            for(var evt in this._storeHandlers) {
                this.store.un(evt, this._storeHandlers[evt], this);
            }
            delete this._storeHandlers;
        }
    },

    /** api: method[createNode]
     *  :param attr: ``Object`` attributes for the new node
     *
     *  Override this function for custom TreeNode node implementation, or to
     *  modify the attributes at creation time.
     */
    createNode: function(attr) {
        if(this.baseAttrs){
            Ext.apply(attr, this.baseAttrs);
        }
        
        return attr;
    },

    /** private: method[destroy]
     */
    destroy: function() {
        this.removeStoreHandlers();
    }
});
