/**
 * The GeoExt.panel.Map used in the application.  Useful to define map options
 * and stuff.
 * @extends GeoExt.panel.Map
 */
Ext.define('CF.view.map.Map', {
    extend: 'GeoExt.panel.Map',
    xtype : 'cf_mappanel',
    requires: [
        'Ext.window.MessageBox',
        'GeoExt.Action',

        'CF.view.map.MapController'
    ],

    // bind the map specific controller
    controller: 'map',

    border: 'false',
    region: 'west',
    width: 600,
    // GeoExt.panel.Map-specific options :
    center: '10.7,50.5',
    zoom: 6,

    /**
     * @private
     */
    initComponent: function() {
        var me = this,
            items = [],
            ctrl;

        var map = new OpenLayers.Map({allOverlays: true, fallThrough: true});

        // ZoomToMaxExtent control, a "button" control
        items.push(Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
            control: new OpenLayers.Control.ZoomToMaxExtent(),
            map: map,
            text: "max extent",
            tooltip: "zoom to max extent"
        })));

        items.push("-");

        // Navigation control
        items.push(Ext.create('Ext.button.Button',Ext.create('GeoExt.Action', {
            text: "nav",
            control: new OpenLayers.Control.Navigation(),
            map: map,
            // button options
            toggleGroup: "draw",
            allowDepress: false,
            pressed: true,
            tooltip: "navigate",
            // check item options
            group: "draw",
            checked: true
        })));

        items.push("-");

        // Navigation history - two "button" controls
        ctrl = new OpenLayers.Control.NavigationHistory();
        map.addControl(ctrl);

        items.push(Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
            text: "previous",
            control: ctrl.previous,
            disabled: true,
            tooltip: "previous in history"
        })));

        items.push(Ext.create('Ext.button.Button', Ext.create('GeoExt.Action', {
            text: "next",
            control: ctrl.next,
            disabled: true,
            tooltip: "next in history"
        })));
        items.push("->");

        Ext.apply(me, {
            map: map,
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: items,
                style: {
                    border: 0,
                    padding: 0
                }
            }]
        });

        me.callParent();
    }
});
