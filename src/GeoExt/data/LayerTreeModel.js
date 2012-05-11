/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full text
 * of the license.
 */

/**
 * Model used for trees that use GeoExt tree components.
 * @class
 */
Ext.define('GeoExt.data.LayerTreeModel',{
    alternateClassName: 'GeoExt.data.LayerTreeRecord',
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.proxy.Memory', 
        'Ext.data.reader.Json'
    ],
    alias: 'model.gx_layertree',
    fields: [  
        {name: 'text', type: 'string'}, 
        {name: 'plugins'},
        {name: 'layer'},
        {name: 'container'},
        {name: 'checkedGroup', type: 'string'},
        {name: 'fixedText', type: 'bool'},
        {name: 'component'}
    ],
    proxy: {
        type: "memory"
    },
    
    /**
     * @private
     */
    constructor: function(data, id, raw, convertedData) {
        var me = this;
       
        me.callParent(arguments);      
        
        window.setTimeout(function() {
            var plugins = me.get('plugins');  

            if (plugins) {
                var plugin, instance;
                for (var i=0, ii=plugins.length; i<ii; ++i) {
                    plugin = plugins[i];
                    instance = Ext.PluginMgr.create(Ext.isString(plugin) ? {
                        ptype: plugin
                    } : plugin);
                    instance.init(me);
                }
            }
        });
    },
    
    afterEdit: function(modifiedFieldNames) {
        this.callParent(arguments);
        this.fireEvent('afteredit', modifiedFieldNames);
    }
});