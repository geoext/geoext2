/**
 * The GeoExt.panel.Map used in the application.  Useful to define map options
 * and stuff.
 * @extends GeoExt.panel.Map
 */
Ext.define('GX.view.Map', {
    // Ext.panel.Panel-specific options: 
    extend: 'GeoExt.panel.Map',
    alias : 'widget.gxapp_map',
    layout: 'fit',
    region: 'west',
    width: 600,
    // GeoExt.panel.Map-specific options : 
    center: '12.3046875,51.48193359375',
    zoom: 6
});
