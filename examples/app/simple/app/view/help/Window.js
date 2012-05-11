/**
 * Help Window with static content using 'contentEl' property.
 * @extends Ext.window.Window
 */
Ext.define('GX.view.help.Window', {
    extend: 'Ext.window.Window',
    alias : 'widget.gxapp_helpwindow',
    initComponent: function() {
        Ext.apply(this, {
            bodyCls: "gxapp-helpwindow",
            closeAction: "hide",
            layout: 'fit',
            maxWidth: 600,
            title: "Help"
        });
        this.callParent(arguments);
    }
});
