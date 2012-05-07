Ext.require('Ext.container.Viewport');
Ext.require('Ext.window.MessageBox');



Ext.application({
    name: 'HelloGeoExt2 - Action',
    launch: function(){
        Ext.state.Manager.setProvider(new Ext.state.CookieProvider({
            expires: new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 7)) //7 days from now
        }));
        
        var map = new OpenLayers.Map({});
        map.addControl(new OpenLayers.Control.LayerSwitcher());
        var wms = new OpenLayers.Layer.WMS('OSM', 'http://intranet.terrestris.de:8010/mapproxy1.2/service?', {
            layers: 'Shaded_Relief',
            format: 'image/jpeg',
            transparent: 'false'
        }, {
            isBaseLayer: true,
            displayInLayerSwitcher: true,
            singleTile: false
        }); 
        
        var reisewarnungen = new OpenLayers.Layer.WMS('Reisewarnungen SOS', 'http://intranet.terrestris.de:8011/geoserver/sos/wms', {
            layers: 'sos:reisehinweise',
            format: 'image/png',
            style: 'sos-gold',
            transparent: true
        }, {
            isBaseLayer: false,
            displayInLayerSwitcher: true,
            singleTile: true
        });
        
        // 
        // 
		
		var vector = new OpenLayers.Layer.Vector("vector");
    	map.addLayers([wms, reisewarnungen, vector]);
        
        var ctrl, toolbarItems = [], action, actions = {};
        
        // ZoomToMaxExtent control, a "button" control
        action = new GeoExt.Action({
            control: new OpenLayers.Control.ZoomToMaxExtent(),
            map: map,
            text: "max extent",
            tooltip: "zoom to max extent"
        });
        actions["max_extent"] = action;
        toolbarItems.push(action);
        toolbarItems.push("-");
        
        // Navigation control and DrawFeature controls
        // in the same toggle group
        action = new GeoExt.Action({
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
        });
        actions["nav"] = action;
        toolbarItems.push(action);
        
        action = new GeoExt.Action({
            text: "draw poly",
            control: new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Polygon),
            map: map,
            // button options
            toggleGroup: "draw",
            allowDepress: false,
            tooltip: "draw polygon",
            // check item options
            group: "draw"
        });
        actions["draw_poly"] = action;
        toolbarItems.push(action);
        
        action = new GeoExt.Action({
            text: "draw line",
            control: new OpenLayers.Control.DrawFeature(vector, OpenLayers.Handler.Path),
            map: map,
            // button options
            toggleGroup: "draw",
            allowDepress: false,
            tooltip: "draw line",
            // check item options
            group: "draw"
        });
        actions["draw_line"] = action;
        toolbarItems.push(action);
        toolbarItems.push("-");
        
        // SelectFeature control, a "toggle" control
        action = new GeoExt.Action({
            text: "select",
            control: new OpenLayers.Control.SelectFeature(vector, {
                type: OpenLayers.Control.TYPE_TOGGLE,
                hover: true
            }),
            map: map,
            // button options
            enableToggle: true,
            tooltip: "select feature"
        });
        actions["select"] = action;
        toolbarItems.push(action);
        toolbarItems.push("-");
        
        // Navigation history - two "button" controls
        ctrl = new OpenLayers.Control.NavigationHistory();
        map.addControl(ctrl);
        
        action = new GeoExt.Action({
            text: "previous",
            control: ctrl.previous,
            disabled: true,
            tooltip: "previous in history"
        });
        actions["previous"] = action;
        toolbarItems.push(action);
        
        action = new GeoExt.Action({
            text: "next",
            control: ctrl.next,
            disabled: true,
            tooltip: "next in history"
        });
        actions["next"] = action;
        toolbarItems.push(action);
        toolbarItems.push("->");
        
        // Reuse the GeoExt.Action objects created above
        // as menu items
        toolbarItems.push({
            text: "menu",
            menu: new Ext.menu.Menu({
                items: [                // ZoomToMaxExtent
                actions["max_extent"],                // Nav
                new Ext.menu.CheckItem(actions["nav"]),                // Draw poly
                new Ext.menu.CheckItem(actions["draw_poly"]),                // Draw line
                new Ext.menu.CheckItem(actions["draw_line"]),                // Select control
                new Ext.menu.CheckItem(actions["select"]),                // Navigation history control
                actions["previous"], actions["next"]]
            })
        });
        
        var mappanel = Ext.create('GeoExt.panel.Map', {
            title: 'The GeoExt.panel.Map-class',
            map: map,
            stateful: true,
            stateId: 'mappanel',
            mapExtent: '7,51,8,52',
            dockedItems: [{
                xtype: 'toolbar',
                dock: 'top',
                items: toolbarItems
            }]
        });
        
        
        Ext.create('Ext.container.Viewport', {
            layout: 'fit',
            items: [mappanel]
        });
        
    }
});
