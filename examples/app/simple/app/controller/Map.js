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
        var me = this;

        // for dev purpose
        ctrl = this;

        var summitProtocol = new OpenLayers.Protocol.HTTP({
            url: "../../data/summits.json",
            format: new OpenLayers.Format.GeoJSON()
        });
        summitProtocol.read({
            callback: me.onSummitRead,
            scope: me
        });
    },

    onSummitRead: function(response) {
        this.getSummitsStore().loadRawData(response.features);
    },
    
    onSummitsStoreLoad: function(store, records) {
        //do custom stuff on summits load if you want...
    }
});
