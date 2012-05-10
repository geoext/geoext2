/**
 * Map controller
 * Used to manage map layers and showing their related views
 */
Ext.define('GX.controller.Map', {
    extend: 'Ext.app.Controller',
    
    models: ['Summit'],
    stores: ['Summits'],
    
    refs: [
        {ref: 'summitChart', selector: 'summitchart'},
        {ref: 'summitGrid', selector: 'summitgrid'}
    ],
    
    init: function() {
        var me = this;

        me.getSummitsStore().on({
            scope: me,
            load : me.onSummitsStoreLoad
        });
    },
    
    onLaunch: function() {
        // for dev purpose
        ctrl = this;
    },
    
    onSummitsStoreLoad: function(store, records) {
        //do custom stuff on summits load if you want...
    }
});
