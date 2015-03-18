Ext.require([
    'Ext.container.Viewport',
    'GeoExt.panel.Map',
    'GeoExt.OverviewMap'
]);

Ext.application({
    name: 'Overview Example - GeoExt2',

    launch: function() {
        var attribution = '&copy; terrestris GmbH & Co. KG <br>' +
                          'Data &copy; OpenStreetMap ' +
                          '<a href="http://www.openstreetmap.org/copyright/en"' +
                          'target="_blank">contributors<a>';

        var wms = new OpenLayers.Layer.WMS(
            "OpenStreetMap WMS",
            "http://ows.terrestris.de/osm/service?",
            {layers: 'OSM-WMS'},
            {
                attribution: attribution,
                isBaseLayer: true
            }
        );

        var wms_grey = new OpenLayers.Layer.WMS(
            "OpenStreetMap WMS (b/w)",
            "http://ows.terrestris.de/osm-gray/service/?",
            {layers: 'OSM-WMS'},
            { attribution: attribution }
        );

        var map = new OpenLayers.Map({
            layers: [wms, wms_grey],
            fallThrough: true,
            center: [13.73, 51.05],
            zoom: 6
        });

        // Customized floating overview container
        var overview = Ext.create('GeoExt.OverviewMap', {
            map: map,
            dynamic: true,
            autoShow: true,
            width: 300,
            height: 200,
            floating: true,
            border: 1,
            style: {
                borderStyle: 'solid'
            },
            resizable: {
                preserveRatio: true,
                heightIncrement: 10,
                widthIncrement: 10,
                handles: 'ne'
            }
        });

        // A viewport with a centered map panel and a sidebar
        var viewport = Ext.create('Ext.container.Viewport', {
            layout: 'border',
            items: [
                // Map panel
                {
                    region: 'center',
                    title: 'Mappanel',
                    xtype: 'gx_mappanel',
                    map: map,
                    tbar: [
                        {
                            text: 'Switch base layer',
                            // switch baselayer to present "dynamic" setting
                            handler: function() {
                                var active = map.baseLayer;
                                map.setBaseLayer(wms === active ? wms_grey : wms);
                            }
                        },
                        {
                            text: 'Toggle overview',
                            handler: function() {
                                if (overview.isVisible()) {
                                    overview.hide();
                                } else {
                                    overview.show();
                                }
                            }
                        }
                    ]
                },
                // Resizable sidebar with vbox layout
                // Child components will be stretched to the width of the sidebar
                {
                    region: 'east',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    width: 300,
                    split: true,
                    items: [
                        {
                            title: 'Description',
                            contentEl: 'desc',
                            bodyStyle: {'padding': '5px'},
                            flex: 2
                        },
                        // Generic overview container as a child component
                        {
                            title: 'Another overview',
                            flex: 1,
                            layout: 'fit',
                            items: [{
                                xtype: 'gx_overviewmap'
                            }]
                        }
                    ]
                }
            ]
        });

        // Positioning the floating component relative to the viewport
        var vOffset = -25 - overview.getHeight();
        var position = overview.getAlignToXY(viewport, 'bl', [25, vOffset]);
        overview.setPosition(position);
    }
});
