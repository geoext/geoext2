/**
 * @require GeoExt/tree/LayerLoader.js
 */

/**
 * @class
 * A subclass of Ext.data.Model decorated with an Ext.data.NodeInterface
 * that will collect all layers of an OpenLayers map. Only layers that
 * have displayInLayerSwitcher set to true will be included.
 * The childrens' iconCls defaults to "gx-tree-layer-icon" and this node'
 * text defaults to "Layers".
 */
Ext.define('GeoExt.tree.LayerContainer', {
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.NodeInterface',
        'GeoExt.tree.LayerLoader'
    ],
    
    /**
     * @cfg {GeoExt.tree.LayerLoader/Object} loader
     * The loader to use with this container. If an Object is provided, a
     * GeoExt.tree.LayerLoader, configured with the the properties from
     * the provided object, will be created. By default, a LayerLoader for
     * all layers of the first MapPanel found by the ComponentManager will be
     * created.
     */
    
    /**
     * The text for this node.
     */
    text: 'Layers',
    
    /**
     * @private
     */
    constructor: function(config) {
        var me = this;
        me.callParent([config]);
        
        Ext.data.NodeInterface.decorate(me);
        
        /*this.loader = config.loader instanceof GeoExt.tree.LayerLoader ?
            config.loader :
            Ext.create('GeoExt.tree.LayerLoader', config.loader);*/
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
