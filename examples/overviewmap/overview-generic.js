Ext.require([
    'Ext.container.Viewport',
    'GeoExt.panel.Map',
    'GeoExt.OverviewMap'
]);

Ext.application({
    name: 'Simple Overview Example - GeoExt2',

    launch: function() {
        var attribution = '&copy; terrestris GmbH & Co. KG <br>' +
                          'Data &copy; OpenStreetMap ' +
                          '<a href="http://www.openstreetmap.org/copyright/en"' +
                          'target="_blank">contributors<a>';

        // A viewport with a centered map panel and a sidebar
        var viewport = Ext.create('Ext.container.Viewport', {
            layout: 'border',
            items: [
                // Map panel
                // maps will be configurated as allOverlays = true
                {
                    region: 'center',
                    title: 'Mappanel',
                    xtype: 'gx_mappanel',
                    center: [13.73, 51.05],
                    zoom: 7,
                    layers: [
                        new OpenLayers.Layer.WMS(
                            "OpenStreetMap WMS",
                            "http://ows.terrestris.de/osm/service?",
                            {layers: 'OSM-WMS'},
                            { attribution: attribution }
                        )
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
                            title: 'Overview',
                            flex: 1,
                            layout: 'fit',
                            items: { xtype: 'gx_overviewmap' }
                        }
                    ]
                }
            ]
        });
    }
});
