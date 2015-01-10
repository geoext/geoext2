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
 * See GeoExt.data.LayerTreeModel for more details on GeoExt extensions to the
 * node configuration.
 *
 * @class GeoExt.tree.LayerNode
 */
Ext.define('GeoExt.tree.LayerNode', {
    extend: 'Ext.AbstractPlugin',
    alias: 'plugin.gx_layer',
    requires: [
        'GeoExt.Version',
        'GeoExt.tree.Util'
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
            "visibilitychanged": this.onLayerVisibilityChanged,
            scope: this
        });
        GeoExt.tree.Util.enforceOneLayerVisible(this.target);
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
            GeoExt.tree.Util.updateLayerVisibilityByNode(this.target, this.target.get('checked'));
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
    }

});
