/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full text
 * of the license.
 */

/*
 * @include GeoExt/tree/LayerLoader.js
 * @include GeoExt/data/Loader.js
 */

/**
 * @class GeoExt.tree.LayerContainer
 * A subclass of Ext.data.Model decorated with an Ext.data.NodeInterface
 * that will collect all layers of an OpenLayers map. Only layers that
 * have displayInLayerSwitcher set to true will be included.
 * The childrens' iconCls defaults to "gx-tree-layer-icon" and this node'
 * text defaults to "Layers".
 */
Ext.define('GeoExt.tree.LayerContainer', {
    extend: 'Ext.AbstractPlugin',
    mixins: ['Ext.util.Observable'],
    requires: [
        'Ext.data.NodeInterface',
        'GeoExt.tree.LayerLoader',
        'GeoExt.data.Loader'
    ],
    alias: 'plugin.gx_layercontainer',
    
    /**
     * @cfg {GeoExt.tree.LayerLoader/Object} loader
     * The loader to use with this container. If an Object is provided, a
     * GeoExt.tree.LayerLoader, configured with the the properties from
     * the provided object, will be created. By default, a LayerLoader for
     * all layers of the first MapPanel found by the ComponentManager will be
     * created.
     */
    
    /**
     * The text for the target node.
     */
    text: 'Layers',
    
    /**
     * @private
     */
    init: function(target) {
        var me = this;

        var loader = me.loader;
        
        me.loader = (loader && loader instanceof GeoExt.tree.LayerLoader) ?
            loader : Ext.create('GeoExt.tree.LayerLoader', loader);
        me.loader.load(target);
        
        Ext.applyIf(target.raw, {text: "Layers"});
    },
    
    /**
     * @private
     * @param {Number} index  The record index in the layer store.
     * @returns {Number} The appropriate child node index for the record.
     */
    recordIndexToNodeIndex: function(index) {
        var me = this;
        var store = me.loader.store;
        var count = store.getCount();
        var nodeCount = me.childNodes.length;
        var nodeIndex = -1;
        for(var i=count-1; i>=0; --i) {
            if(me.loader.filter(store.getAt(i)) === true) {
                ++nodeIndex;
                if(index === i || nodeIndex > nodeCount-1) {
                    break;
                }
            }
        }
        return nodeIndex;
    },
    
    /**
     * @private
     */
    destroy: function() {
        var me = this;
        if (!(me.initialConfig.loader instanceof GeoExt.data.Loader)) {
            me.loader.destroy();
        }
        delete me.loader;
        me.callParent();
    }
});
