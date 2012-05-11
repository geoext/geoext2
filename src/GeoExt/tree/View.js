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
Ext.define('GeoExt.tree.View', {
    extend: 'Ext.tree.View',
    alias: 'widget.gx_treeview',

    initComponent : function() {
        var me = this;

        me.on('itemupdate', this.onItem, this);
        me.on('itemadd', this.onItem, this);
        me.on('createchild', this.createChild, this);

        return me.callParent(arguments);
    },

    onItem: function(records, index, node, options) {
        var me = this;

        if(!(records instanceof Array)) {
            records = [records]
        }

        for(var i=0; i<records.length; i++) {
            this.onNodeRendered(records[i]);
        }
    },

    onNodeRendered: function(node) {
        var me = this;

        var el = Ext.get('tree-record-'+node.id);
        if(!el) {
            return;
        }

        if(node.get('layer'))
            me.fireEvent('createchild', el, node);

        if(node.hasChildNodes()) {
            node.eachChild(function(node) {
                me.onNodeRendered(node);
            }, me);
        }
    },

    createChild: function(el, node) {

        var component = node.get('component');

        if(component) {
            cmpObj = Ext.ComponentManager.create(component);

            cmpObj.render(el);

            el.removeCls('gx-tree-component-off');
        }
    }

});
