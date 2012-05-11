Ext.define('GeoExt.tree.LayerNode', {
    extend: 'Ext.AbstractPlugin',
    mixins: ['Ext.util.Observable'],
    alias: 'plugin.gx_layer',

    /**
     * If provided, nodes will be rendered with a radio button instead of a
     * checkbox. All layers represented by nodes with the same checkedGroup are
     * considered mutually exclusive - only one can be visible at a time.
     * @cfg {String} checkedGroup
     */
    
    /**
     * If the node was configured with a text, we consider the text fixed and
     * won't update it when the layer's name changes.
     * @cfg {Boolean} fixedText
     */
    
    /** 
     *  @private
     */
    init: function(target) {

        this.target = target;
        var layer = target.get('layer');

        target.set('checked', layer.getVisibility());
        target.set('checkedGroup', this.checkedGroup === undefined ?
            layer.isBaseLayer ? "gx_baselayer" : "" :
            "");
        target.set('fixedText', !!target.text);
        
        target.set('leaf', true);
        
        if(!target.get('iconCls')) {
            target.set('iconCls', "gx-tree-layer-icon");
        }

        target.on('afteredit', this.onAfterEdit, this);
        layer.events.on({
            "visibilitychanged": this.onLayerVisibilityChanged,
            scope: this
        });
    },

    onAfterEdit: function(modifiedFields) {
        var me = this;

        if(~modifiedFields.indexOf('checked')) {
            this.onCheckChange();
        }
    },
    
    /** private: method[onLayerVisiilityChanged
     *  handler for visibilitychanged events on the layer
     * @scope (Ext.data.NodeInterface) current node
     */
    onLayerVisibilityChanged: function() {
        if(!this._visibilityChanging) {
            this.target.set('checked', this.target.get('layer').getVisibility());
        }
    },
    
    /** private: method[onCheckChange]
     *  :param node: ``GeoExt.tree.LayerNode``
     *  :param checked: ``Boolean``
     *
     *  handler for checkchange events 
     */
    onCheckChange: function() {
        var node = this.target,
            checked = this.target.get('checked');

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
