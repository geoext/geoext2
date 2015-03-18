/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @requires GeoExt/Version.js
 */

/**
 * The LayerNode plugin. This is used to create a node that is connected to
 * a layer, so the checkbox and the layer's visibility are in sync. A basic
 * layer node would be configured like this:
 *
 *     {
 *         plugins: ['gx_layernode'],
 *         layer: myLayer
 *     }
 *
 * When the layer associated with this GeoExt.tree.LayerNode is no longer in
 * range (invisible due to resolution constraints), the layer will be visually
 * marked as disabled.
 *
 * If you do not want this behaviour, include the following CSS code:
 *
 *     .gx-tree-row-disabled span.x-tree-node-text {
 *         opacity: inherit;
 *         font-style: inherit;
 *     }
 *
 * If additionally you want to make the nodes checkbox unusable when the node is
 * disabled, you could use the following CSS-snippet:
 *
 *     .gx-tree-row-disabled input {
 *         visibility: hidden;
 *     }
 *
 * See GeoExt.data.LayerTreeModel for more details on GeoExt extensions to the
 * node configuration.
 *
 * @class GeoExt.tree.LayerNode
 */
Ext.define('GeoExt.tree.LayerNode', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.gx_layer',
    requires: [
        'GeoExt.Version'
    ],
    /**
     * The init method is invoked after initComponent method has been run for
     * the client Component. It performs plugin initialization.
     *
     * @param {Ext.Component} target The client Component which owns this
     *     plugin.
     * @private
     */
    init: function(target) {

        this.target = target;
        var layer = target.get('layer');

        target.set('checked', layer.getVisibility());
        if (!target.get('checkedGroup') && layer.isBaseLayer) {
            target.set('checkedGroup', 'gx_baselayer');
        }
        target.set('fixedText', !!target.text);

        target.set('leaf', true);

        if(!target.get('iconCls')) {
            target.set('iconCls', "gx-tree-layer-icon");
        }

        target.on('afteredit', this.onAfterEdit, this);

        layer.events.on({
            'visibilitychanged': this.onLayerVisibilityChanged,
            scope: this
        });

        if (!layer.alwaysInRange && layer.map) {
            layer.map.events.register('moveend', this, this.onMapMoveend);
        }

        this.enforceOneVisible();
    },

    /**
     * Handler for the node's afteredit event.
     *
     * @param {GeoExt.data.LayerTreeModel} node
     * @param {String[]} modifiedFields
     * @private
     */
    onAfterEdit: function(node, modifiedFields) {
        var me = this;

        if(~Ext.Array.indexOf(modifiedFields, 'checked')) {
            me.onCheckChange();
        }
    },

    /**
     * Handler for visibilitychanged events on the layer.
     *
     * @private
     */
    onLayerVisibilityChanged: function() {
        if(!this._visibilityChanging) {
            this.target.set('checked', this.target.get('layer').getVisibility());
        }
    },

    /**
     *  handler for map moveend events to determine if node should be
     *  disabled or enabled
     *
     * @private
     */
    onMapMoveend: function(e) {
        this.target.set('disabled', !this.target.get('layer').inRange);
    },

    /**
     * Updates the visibility of the layer that is connected to the target
     * node.
     *
     * @private
     */
    onCheckChange: function() {
        var node = this.target,
            checked = this.target.get('checked');

        if(checked != node.get('layer').getVisibility()) {
            node._visibilityChanging = true;
            var layer = node.get('layer');
            if(checked && layer.isBaseLayer && layer.map) {
                layer.map.setBaseLayer(layer);
            } else if(!checked && layer.isBaseLayer && layer.map &&
                      layer.map.baseLayer && layer.id == layer.map.baseLayer.id) {
                // Must prevent the unchecking of radio buttons
                node.set('checked', layer.getVisibility());
            } else {
                layer.setVisibility(checked);
            }
            delete node._visibilityChanging;
        }
        this.enforceOneVisible();
    },

    enforceOneVisible: function() {
        var attributes = this.target.data;
        var group = attributes.checkedGroup;
        // If we are in the baselayer group, the map will take care of
        // enforcing visibility.
        if(group && group !== "gx_baselayer") {
            var layer = this.target.get('layer');
            var checkedNodes = this.target.getOwnerTree().getChecked();
            var checkedCount = 0;
            // enforce "not more than one visible"
            Ext.each(checkedNodes, function(n){
                var l = n.data.layer;
                if(!n.data.hidden && n.data.checkedGroup === group) {
                    checkedCount++;
                    if(l != layer && attributes.checked) {
                        l.setVisibility(false);
                    }
                }
            });
            // enforce "at least one visible"
            if(checkedCount === 0 && attributes.checked == false) {
                layer.setVisibility(true);
            }
        }
    }

});
