Ext.require([
    'GeoExt.panel.Map',
    'GeoExt.slider.Zoom'
]);

var panel, slider;

Ext.onReady(function() {
    
    // create a map panel with an embedded slider
    panel = new GeoExt.MapPanel({
        title: "Map",
        renderTo: "map-container",
        height: 300,
        width: 400,
        map: {
            controls: [new OpenLayers.Control.Navigation()]
        },
        layers: [new OpenLayers.Layer.WMS(
            "Global Imagery",
            "http://maps.opengeo.org/geowebcache/service/wms",
            {layers: "bluemarble"}
        )],
        extent: [-5, 35, 15, 55]
        
        ,
        items: [{
            xtype: "gx_zoomslider",
            vertical: true,
            height: 100,
            x: 10,
            y: 20
//            ,
//            plugins: new GeoExt.ZoomSliderTip()
        }]
    });
    
    // create a separate slider bound to the map but displayed elsewhere
    slider = new GeoExt.ZoomSlider({
        map: panel.map,
        aggressive: true,                                                                                                                                                   
        width: 200,
//        plugins: new GeoExt.ZoomSliderTip({
//            template: "<div>Zoom Level: {zoom}</div>"
//        }),
        renderTo: document.body
    });

});
