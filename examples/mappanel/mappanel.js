Ext.Loader.setConfig({
    enabled: true,
    disableCaching: false,
    paths: {
        GeoExt: "../../src/GeoExt"
    }
});

Ext.require(['Ext.container.Viewport','Ext.window.MessageBox','GeoExt.panel.Map']);

Ext.application({
    name: 'HelloGeoExt2',
    launch: function() {
        Ext.state.Manager.setProvider(new Ext.state.CookieProvider({
            expires: new Date(new Date().getTime()+(1000*60*60*24*7)) //7 days from now
        }));
        var map = new OpenLayers.Map({});
        
        var wms = new OpenLayers.Layer.WMS(
            "OpenLayers WMS",
            "http://vmap0.tiles.osgeo.org/wms/vmap0?",
            {layers: 'basic'}
        );
        
        map.addLayers([wms]);
        
        var mappanel = Ext.create('GeoExt.panel.Map', {
            title: 'The GeoExt.panel.Map-class'
            ,map: map
//            ,layers: [ol_wms.clone()]
            ,stateful: true
            ,stateId: 'mappanel'
            //,mapCenter: '12.3046875,51.48193359375'
            //,mapZoom: 8
            ,mapExtent: '7,51,8,52'
            ,dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: [{
                    text: 'Current center of the map',
                    handler: function(){
                        var c = GeoExt.panel.Map.guess().getMap().getCenter();
                        Ext.Msg.alert(this.getText(), c.toString());
                    }
                }]
            }]
        });
        
        
        Ext.create('Ext.container.Viewport', {
            layout: 'fit',
            items: [
                mappanel
            ]
        });
    }
});