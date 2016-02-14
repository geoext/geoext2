/*
 * Copyright (c) 2008-present The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */
Ext.define('GeoExt.tree.Util', {
    statics: {
        /**
         * Updates the visibility of the layer that is connected to given
         * node.
         *
         * @param {Ext.data.NodeInterface} node The node.
         * @param {boolean} checked the new checked state.
         */
        updateLayerVisibilityByNode: function(node, checked) {
            var layer = node.get('layer');
            if(layer && checked != layer.getVisibility()) {
                node._visibilityChanging = true;
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
            GeoExt.tree.Util.enforceOneLayerVisible(node);
        },

        /**
         * Enforces that one layer of the node is visible.
         *
         * @param {Ext.data.NodeInterface} node The node.
         */
        enforceOneLayerVisible: function(node) {
            var attributes = node.data;
            var group = attributes.checkedGroup;
            // If we are in the baselayer group, the map will take care of
            // enforcing visibility.
            if(group && group !== "gx_baselayer") {
                var layer = node.get('layer');
                var ownerTree = node.getOwnerTree();
                if (ownerTree === undefined) return;
                var checkedNodes = ownerTree.getChecked();
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
                if(checkedCount === 0 && attributes.checked === false) {
                    layer.setVisibility(true);
                }
            }
        }
    }
});
