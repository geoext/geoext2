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
        view.on('refresh', this.onViewRefresh, this);
        view.on('itemadd', this.onViewItemAdd, this);
        view.on('itemupdate', this.onViewItemUpdate, this);
    },

    onViewBeforeRender : function(view) {
        var me = this;

    },

    onViewRender : function(view) {
        var me = this;

    },

    onViewRefresh : function(view, options) {
        var me = this;

        view.node.eachChild(function(node) {
            this.onNodeRendered(node);
        }, me);
    },

    onViewItemAdd: function(record, index, htmlNode, options) {

        this.onNodeRendered(record);
    },

    onViewItemUpdate: function(record, index, htmlNode, options) {

        this.onNodeRendered(record);
    },

    onNodeRendered: function(node) {
        var me = this;

        var el = Ext.get('tree-record-'+node.id);
        if(!el) {
            return;
        }

        if(node.get('layer'))
            me.createChild(el, node);

        if(node.hasChildNodes()) {
            node.eachChild(function(node) {
                me.onNodeRendered(node);
            }, me);
        }
    },

    createChild: function(el, child) {
        el.removeCls('gx-tree-component-off');
        el.createChild('Got it!');
    }
});
