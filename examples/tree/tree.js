Ext.require([
    'Ext.container.Viewport',
    'Ext.layout.container.Border',
    'Ext.tree.Panel',
    'Ext.tree.plugin.TreeViewDragDrop',
    'GeoExt.panel.Map',
    'GeoExt.tree.LayerContainer',
    'GeoExt.data.LayerTreeModel',
    'GeoExt.tree.plugin.LayerTreeView'
]);

var mapPanel, tree;

Ext.application({
    name: 'Tree',
    launch: function() {
        // create a map panel with some layers that we will show in our layer tree
        // below.
        mapPanel = Ext.create('GeoExt.panel.Map', {
            border: true,
            region: "center",
            // we do not want all overlays, to try the OverlayLayerContainer
            map: {allOverlays: false},
            center: [146.1569825, -41.6109735],
            zoom: 6,
            layers: [
                new OpenLayers.Layer.WMS("Global Imagery",
                    "http://maps.opengeo.org/geowebcache/service/wms", {
                        layers: "bluemarble",
                        format: "image/png8"
                    }, {
                        buffer: 0,
                        visibility: false
                    }
                ),
                new OpenLayers.Layer.WMS("Tasmania State Boundaries",
                    "http://demo.opengeo.org/geoserver/wms", {
                        layers: "topp:tasmania_state_boundaries"
                    }, {
                        buffer: 0
                    }
                ),
                new OpenLayers.Layer.WMS("Water",
                    "http://demo.opengeo.org/geoserver/wms", {
                        layers: "topp:tasmania_water_bodies",
                        transparent: true,
                        format: "image/gif"
                    }, {
                        isBaseLayer: false,
                        buffer: 0
                    }
                ),
                new OpenLayers.Layer.WMS("Cities",
                    "http://demo.opengeo.org/geoserver/wms", {
                        layers: "topp:tasmania_cities",
                        transparent: true,
                        format: "image/gif"
                    }, {
                        isBaseLayer: false,
                        buffer: 0
                    }
                ),
                new OpenLayers.Layer.WMS("Tasmania Roads",
                    "http://demo.opengeo.org/geoserver/wms", {
                        layers: "topp:tasmania_roads",
                        transparent: true,
                        format: "image/gif"
                    }, {
                        isBaseLayer: false,
                        buffer: 0,
                        maxResolution: 0.010986328125
                    }
                ),
                // create a group layer (with several layers in the "layers" param)
                // to show how the LayerParamLoader works
                new OpenLayers.Layer.WMS("Tasmania (Group Layer)",
                    "http://demo.opengeo.org/geoserver/wms", {
                        layers: [
                            "topp:tasmania_state_boundaries",
                            "topp:tasmania_water_bodies",
                            "topp:tasmania_cities",
                            "topp:tasmania_roads"
                        ],
                        transparent: true,
                        format: "image/gif"
                    }, {
                        isBaseLayer: false,
                        buffer: 0,
                        // exclude this layer from layer container nodes
                        displayInLayerSwitcher: false,
                        visibility: false
                    }
                )
            ]
        });

        // create our own layer node UI class, using the TreeNodeUIEventMixin
        //var LayerNodeUI = Ext.extend(GeoExt.tree.LayerNodeUI, new GeoExt.tree.TreeNodeUIEventMixin());
        
        /*var treeConfig = [
            {text: "myplainnode", leaf: true},
            {nodeType: 'gx_layercontainer', layerStore: map.layers}
        {
            nodeType: "gx_baselayercontainer"
        }, {
            nodeType: "gx_overlaylayercontainer",
            expanded: true,
            // render the nodes inside this container with a radio button,
            // and assign them the group "foo".
            loader: {
                baseAttrs: {
                    radioGroup: "foo",
                    uiProvider: "layernodeui"
                }
            }
        }, {
            nodeType: "gx_layer",
            layer: "Tasmania (Group Layer)",
            isLeaf: false,
            // create subnodes for the layers in the LAYERS param. If we assign
            // a loader to a LayerNode and do not provide a loader class, a
            // LayerParamLoader will be assumed.
            loader: {
                param: "LAYERS"
            }
        }];*/

        var store = Ext.create('Ext.data.TreeStore', {
            model: 'GeoExt.data.LayerTreeModel',
            root: {
                expanded: true,
                children: [
                    {text: "myplainnode", leaf: true},
                    {plugins: ['gx_layercontainer']},
                    {plugins: [{
                        ptype: 'gx_layercontainer',
                        layers: mapPanel.layers
                    }], text: "My Layers", expanded: true}
                ]
            }
        });

        // create the tree with the configuration from above
        tree = Ext.create('Ext.tree.Panel', {
            border: true,
            region: "west",
            title: "Layers",
            width: 200,
            split: true,
            collapsible: true,
            collapseMode: "mini",
            autoScroll: true,
            /*plugins: [
                new GeoExt.plugins.TreeNodeRadioButton({
                    listeners: {
                        "radiochange": function(node) {
                            alert(node.text + " is now the active layer.");
                        }
                    }
                })
            ],*/
            store: store,
            rootVisible: false,
            lines: false,
            viewConfig: {
                plugins: [{
                    ptype: 'treeviewdragdrop',
                    appendOnly: false
                }, {
                    ptype: 'layertreeview'
                }]
            }
        });
    
        Ext.create('Ext.Viewport', {
            layout: "fit",
            hideBorders: true,
            items: {
                layout: "border",
                deferredRender: false,
                items: [mapPanel, tree, {
                    contentEl: "desc",
                    region: "east",
                    bodyStyle: {"padding": "5px"},
                    collapsible: true,
                    collapseMode: "mini",
                    split: true,
                    width: 200,
                    title: "Description"
                }]
            }
        });
    }
});
