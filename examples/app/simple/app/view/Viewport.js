/**
 * The main application viewport, which displays the whole application
 * @extends Ext.Viewport
 */
Ext.define('GX.view.Viewport', {
    extend: 'Ext.Viewport',    
    layout: 'fit',
    
    requires: [
        'Ext.resizer.Splitter',
        'GX.view.Header',
        'GX.view.summit.Chart',
        'GX.view.summit.Grid'
    ],
    
    initComponent: function() {
        var me = this;
        
        Ext.apply(me, {
            items: [{
                xtype: 'panel',
                border: false,
                id    : 'viewport',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                dockedItems: [
                    Ext.create('GX.view.Header')
                ],
                items: [
                    Ext.create('GX.view.summit.Grid'),
                    {xtype: 'splitter'},
                    Ext.create('GX.view.summit.Chart')
                ]
            }]
        });
                
        me.callParent(arguments);
    }
});
