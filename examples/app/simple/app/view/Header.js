/**
 * The application header displayed at the top of the viewport
 * @extends Ext.Component
 */
Ext.define('GX.view.Header', {
    extend: 'Ext.Component',

    dock: 'top',
    baseCls: 'app-header',

    initComponent: function() {
        Ext.applyIf(this, {
            html: 'MVC simple application example called GX'
        });

        this.callParent(arguments);
    }
});
