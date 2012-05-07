Ext.require('Ext.container.Viewport');
Ext.require('Ext.window.MessageBox');



Ext.application({
    name: 'HelloGeoExt2',
    launch: function() {
        Ext.state.Manager.setProvider(new Ext.state.CookieProvider({
            expires: new Date(new Date().getTime()+(1000*60*60*24*7)) //7 days from now
        }));
        var map = new OpenLayers.Map({});
        var ol_wms = new OpenLayers.Layer.WMS(
            "terrestris OWS", 
            "http://intranet.terrestris.de:8010/cgi-bin/qgis_mapserv", 
            {
                layers: [
                    'Shaded_Relief',
                    'Populated_Places',
                    'Level_1_Admin_Boundaries',
                    'Urban_Areas',
                    'Marine_Geography',
                    'Centerlines_Rivers_Lake'
                ],
                map: '/var/data/geodata/world/projects/natural_earth.qgs'
            },
            {
                attribution: '&copy; <a href="http://terrestris.de/">terrestris</a> freier OWS-Dienst, Datasource <a href="http://www.naturalearthdata.com/">Natural Earth</a> (<acronym title="Public Domain">PD</acronym>)'
            }
        );
        
        map.addLayers([ol_wms]);
        
        var mappanel = Ext.create('GeoExt.panel.Map', {
            title: 'The GeoExt.panel.Map-class'
            ,map: map
//            ,layers: [ol_wms.clone()]
            ,stateful: true
            ,stateId: 'mappanel'
            ,mapCenter: '2.648274,39.567489'
            ,mapZoom: 7
            //,mapExtent: '7,51,8,52'
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