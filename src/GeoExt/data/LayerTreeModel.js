Ext.define('GeoExt.data.LayerTreeModel',{
    alternateClassName: 'GeoExt.data.LayerTreeRecord',
    extend: 'Ext.data.Model',
    requires: ['Ext.data.proxy.Memory', 'Ext.data.reader.Json'],
    alias: 'model.gx_layertree',
    fields: [  
        {name: 'text', type: 'string'}, 
        {name: 'plugins'},
        {name: 'checkedGroup', type: 'string'}
    ],
    
    init: function() {
        var me = this;

        if (me.raw && me.raw.plugins) {
            var plugins = me.raw.plugins,
                plugin, instance;
            for (var i=0, ii=plugins.length; i<ii; ++i) {
                plugin = plugins[i];
                instance = Ext.PluginMgr.create(Ext.isString(plugin) ? {
                    ptype: plugin
                } : plugin);
                instance.init(me);
            }
        }
    }
});