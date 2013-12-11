Ext.require([
    'Ext.container.Viewport',
    'Ext.layout.container.Border',
    'GeoExt.tree.Panel',
    'Ext.tree.plugin.TreeViewDragDrop',
    'GeoExt.panel.Map',
    'GeoExt.tree.OverlayLayerContainer',
    'GeoExt.tree.BaseLayerContainer',
    'GeoExt.data.LayerTreeModel',
    'GeoExt.tree.View',
    'GeoExt.container.WmsLegend',
    'GeoExt.tree.Column',
    // We need to require this class, even though it is used by Ext.EventObjectImpl
    // see: http://www.sencha.com/forum/showthread.php?262124-Missed-(-)-dependency-reference-to-a-Ext.util.Point-in-Ext.EventObjectImpl
    'Ext.util.Point'
]);

Ext.application({
    name: 'Tree Legend',
    launch: function() {
        var mapPanel = new GeoExt.MapPanel({
            region: "center",
            center: [146.1569825, -41.6109735],
            zoom: 6,
            layers: [
                new OpenLayers.Layer.WMS("Tasmania State Boundaries",
                    "http://demo.opengeo.org/geoserver/wms", {
                        layers: "topp:tasmania_state_boundaries"
                    }, {
                        buffer: 0,
                        // exclude this layer from layer container nodes
                        displayInLayerSwitcher: false
                   }),
                new OpenLayers.Layer.WMS("Water",
                    "http://demo.opengeo.org/geoserver/wms", {
                        layers: "topp:tasmania_water_bodies",
                        transparent: true,
                        format: "image/gif"
                    }, {
                        buffer: 0
                    }),
                new OpenLayers.Layer.WMS("Cities",
                    "http://demo.opengeo.org/geoserver/wms", {
                        layers: "topp:tasmania_cities",
                        transparent: true,
                        format: "image/gif"
                    }, {
                        buffer: 0
                    }),
                new OpenLayers.Layer.WMS("Tasmania Roads",
                    "http://demo.opengeo.org/geoserver/wms", {
                        layers: "topp:tasmania_roads",
                        transparent: true,
                        format: "image/gif"
                    }, {
                        buffer: 0
                    })
            ]
        });

        var store = Ext.create('Ext.data.TreeStore', {
            model: 'GeoExt.data.LayerTreeModel',
            root: {
                plugins: [{
                    ptype: "gx_layercontainer",
                    loader: {
                        createNode: function(attr) {
                            // add a WMS legend to each node created
                            attr.component = {
                                xtype: "gx_wmslegend",
                                layerRecord: mapPanel.layers.getByLayer(attr.layer),
                                showTitle: false,
                                hidden: true,
                                deferRender: true,
                                // custom class for css positioning
                                // see tree-legend.html
                                cls: "legend"
                            };
                            return GeoExt.tree.LayerLoader.prototype.createNode.call(this, attr);
                        }
                    }
                }]
            }
        });

        

        var tree = new GeoExt.tree.Panel({
            title: "Layers",
            width: 250,
            autoScroll: true,
            viewConfig: {
                plugins: [{
                    ptype: 'treeviewdragdrop',
                    appendOnly: false
                }]
            },
            store: store,
            rootVisible: false,
            lines: false,
            listeners:{
                cellclick: function(tree, td, cellIndex, record) {
                  var node = record;
                  var legend = record.gx_treecomponents.gx_wmslegend;
                  if (legend.isHidden()) {
                    if (!legend.rendered) {
                      legend.render(node.el);
                    }
                    // NOTE: will not recalculate height of tree panel
                    legend.show();
                  } else {
                    legend.hide();
                  }
                  
                  // NOTE: this will recalculate height of tree panel
                  /*tree.getTreeStore().getRootNode().appendChild({
                    text: "Test"
                  });*/
                },
                scope: this
            }
        });
        
        var east = Ext.create('Ext.Panel', {
            region: "east",
            items: [tree, { title: "Other stuff", width: 250, html: "Test" }]
        });

        new Ext.Viewport({
            layout: "fit",
            hideBorders: true,
            items: {
                layout: "border",
                items: [
                    mapPanel, east, {
                        contentEl: desc,
                        region: "west",
                        width: 250,
                        bodyStyle: {padding: "5px"}
                    }
                ]
            }
        });
    }
});
