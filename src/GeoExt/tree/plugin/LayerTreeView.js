/**
 * This plugin provides basic tree - map synchronisation functionality for a TreeView.
 *
 * It creates a specialized instance of modify the nodes on the fly and adds
 * event listeners to the tree and the maps to get both in sync.
 *
 * Note that the plugin must be added to the tree view, not to the tree panel. For example using viewConfig:
 *
 *     viewConfig: {
 *         plugins: { ptype: 'layertreeview' }
 *     }
 */
Ext.define('GeoExt.tree.plugin.LayerTreeView', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.layertreeview',

    /**
     * @cfg {Boolean} autoDisable
     * True if the tree should disable nodes when layers are out of range.
     */
    autoDisable: true,

    target: null,

    init : function(view) {

        this.target = view;

        view.on('beforerender', this.onViewBeforeRender, this, {single: true});
        view.on('render', this.onViewRender, this, {single: true});
    },

    onViewBeforeRender : function(view) {
        var me = this;

        view.node.eachChild(function(node) {
            this.setNodeVisibility(node);
        }, me);
    },

    onViewRender : function(view) {
        var me = this;

        console.log('render');
    },

    setNodeVisibility: function(node) {

        if((node.get('checked') || node.get('checked') == false) &&
           node.get('layer') && node.get('layer').CLASS_NAME && 
           node.get('layer').CLASS_NAME.substr(0, 16) == 'OpenLayers.Layer') {

            // Set the tree node visibility to the layer visibility
            node.set('checked', node.get('layer').getVisibility());

            // Attach the node and layer together with events
            this.addVisibilityEventHandlers(node)
        }

        if(node.hasChildNodes()) {
            node.eachChild(function(node) {
                    this.setNodeVisibility(node);
            }, this);
        }
    },
    
    /** private: method[addVisibilityHandlers]
     *  Adds handlers that sync the checkbox state with the layer's visibility
     *  state
     */
    addVisibilityEventHandlers: function(node) {
        var me = this,
            layer = node.get('layer');

        layer.events.on({
            "visibilitychanged": this.onLayerVisibilityChanged,
            scope: node
        });
        this.target.on({
            "checkchange": this.onCheckChange,
            scope: me
        });
        if(this.autoDisable&&0){
            if (layer.map) {
                layer.map.events.register("moveend", node, this.onMapMoveend);
            } else {
                layer.events.register("added", node, function added() {
                    this.get('layer').events.unregister("added", node, added);
                    this.get('layer').map.events.register("moveend", node, this.onMapMoveend);
                });
            }
        }
    },
    
    /** private: method[onLayerVisiilityChanged
     *  handler for visibilitychanged events on the layer
     * @scope (Ext.data.NodeInterface) current node
     */
    onLayerVisibilityChanged: function() {
        if(!this._visibilityChanging) {
            this.set('checked', this.get('layer').getVisibility());
        }
    },
    
    /** private: method[onCheckChange]
     *  :param node: ``GeoExt.tree.LayerNode``
     *  :param checked: ``Boolean``
     *
     *  handler for checkchange events 
     */
    onCheckChange: function(node, checked) {
        if(checked != node.get('layer').getVisibility()) {
            node._visibilityChanging = true;
            var layer = node.get('layer');
            if(checked && layer.isBaseLayer && layer.map) {
                layer.map.setBaseLayer(layer);
            } else {
                layer.setVisibility(checked);
            }
            delete node._visibilityChanging;
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
    }
});
