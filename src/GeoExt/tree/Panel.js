Ext.define('GeoExt.tree.Panel', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.gx_treepanel',
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

        me.callParent();
    }
});
