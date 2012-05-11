/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full text
 * of the license.
 */

/**
 * @class GeoExt.tree.LayerNode
 *
 * The LayerNode plugin
 */
Ext.define('GeoExt.tree.LayerNode', {
    extend: 'Ext.AbstractPlugin',
    mixins: ['Ext.util.Observable'],
    alias: 'plugin.gx_layer',

    /**
     * The layer that the layer node will be bound to.
     * @cfg {OpenLayers.Layer} layer
     */

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
     * @method
     * The init method is invoked after initComponent method has been run for the client Component.
     *
     * It perform plugin initialization.
     * @param {Ext.Component} target The client Component which owns this plugin.
     */
    init: function(target) {
        target.raw.checked = "";
        target.raw.layer = this.layer;
        target.raw.checkedGroup = this.checkedGroup === undefined ?
            this.layer.isBaseLayer ? "gx_baselayer" : "" :
            "";
        target.raw.fixedText = !!target.raw.text;
        
        target.raw.leaf = target.raw.leaf || !target.raw.children;
        
        if(!target.raw.iconCls && !target.raw.children) {
            target.raw.iconCls = "gx-tree-layer-icon";
        }
        
        if (target.raw.text) {
            this.fixedText = true;
        }
    }

});