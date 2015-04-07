/*
 * Copyright (c) 2008-2015 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @requires GeoExt/tree/Column.js
 * @requires GeoExt/tree/View.js
 */

/**
 * An Ext.tree.Panel pre-configured with a GeoExt.tree.Column.
 *
 * When you use the tree in an application, make sure to include the proper
 * stylesheet depending on the Ext theme that you use: `tree-classic.css`,
 * `tree-access.css`, 'tree-gray.css` or `tree-neptune.css`.
 * 
 * @class GeoExt.tree.Panel
 */
Ext.define('GeoExt.tree.Panel', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.gx_treepanel',
    requires: [
        'GeoExt.tree.Column',
        'GeoExt.tree.View',
        'GeoExt.tree.Util'
    ],
    viewType: 'gx_treeview',
    
    initComponent: function() {
        var me = this;

        if (!me.columns) {
            if (me.initialConfig.hideHeaders === undefined) {
                me.hideHeaders = true;
            }
            me.addCls(Ext.baseCSSPrefix + 'autowidth-table');
            me.columns = [{
                xtype    : 'gx_treecolumn',
                text     : 'Name',
                width    : Ext.isIE6 ? null : 10000,
                dataIndex: me.displayField         
            }];
        }
        // bind checkchange for tree nodes to steer visibility of the layers
        me.on('checkchange', GeoExt.tree.Util.updateLayerVisibilityByNode);

        me.callParent();
    }
});
