/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include GeoExt/tree/Panel.js
 * @include GeoExt/tree/LayerGroupContainer.js
 * @include GeoExt/data/LayerStore.js
 * @include GeoExt/panel/Map.js
 */

Ext.define('GeoExt.tree.LayerTreeBuilder', {
    extend: 'GeoExt.tree.Panel',
    requires: [
        'GeoExt.data.LayerStore',
        'GeoExt.panel.Map',
        'GeoExt.tree.LayerGroupContainer'
    ],
    alias: 'widget.gx_layertreebuilder',

    /** 
     * @cfg {String} Text to display the default "base layers" group (i18n).
     */
    baseLayersText: "Base layers",

    /** 
     * @cfg {String} Text to display the default "other layers" group (i18n).
     */
    otherLayersText: "Other layers",

    layerStore: null,

    enableWmsLegends: true,

    enableVectorLegends: true,

    checkableContainerGroupNodes: true,

    checkableLeafGroupNodes: true,

    initComponent: function(){
        Ext.apply(this, {
            autoScroll: true,
            lines: false,
            rootVisible: false,
            store: Ext.create('Ext.data.TreeStore', {
                  model: 'GeoExt.data.LayerTreeModel'
            })
        });

        // Don't do anything if a layerstore hasn't been provided yet.
        // Developer will need to set the layerStore and call 
        // initLayerStore again
        if (this.layerStore) {
            this.initLayerStore();
        }

        this.callParent(arguments);
    },

    initLayerStore: function() {

        // Process new layers as they come in
        this.layerStore.on({
            "add": this.onLayerAdded,
            scope: this
        });

        // after the layertree has been rendered, look for already added
        // layer records, else, wait till afterrender event has fired
        if (this.rendered) {
            this.processLayerStore();
        } else {
            // after the layertree has been rendered, look for already added
            // layer records            
            this.on({
                "afterrender": this.processLayerStore, 
                scope: this
            });
            // add a handler for checkboxes associated with nodes
            this.on({
                'checkchange' : function(node) {
                    // If a parent node is unchecked, uncheck all
                    // the children and vice versa
                    var me = this;
                    if(node.data.checked) {
                        node.eachChild(function(child) {
                            child.set('checked',true);
                            me.fireEvent('checkchange',child,true);
                        });
                    } else {
                        node.eachChild(function(child) {
                            child.set('checked',false);
                            me.fireEvent('checkchange',child,false);
                        });
                    }
                    this.updateCheckboxes(node.parentNode);
                },
                scope: this
            });
        }
    },

    // private
    processLayerStore: function() {
        if (this.layerStore.getCount() > 0) {
            this.onLayerAdded(
                this.layerStore,
                this.layerStore.data.items
            );
        }
    },


    // make sure that a parent checkbox is only checked if all of it's
    // children are also checked
    updateCheckboxes: function(node) {
        if(node.isRoot()) return;
        var allChecked = true;
        for(var i=0; i<node.childNodes.length; i++) {
            if(!node.childNodes[i].data.checked) allChecked = false;
        }
        // check according to checkableContainerGroupNodes and checkableLeafGroupNodes properties
        if (node.plugins && node.plugins[0] && node.plugins[0].pype == "gx_layergroupcontainer") {
            checkableNode = this.checkableLeafGroupNodes;
        } else {
            checkableNode = this.checkableContainerGroupNodes && this.checkableLeafGroupNodes;
        }
        if (checkableNode) {
            node.set('checked',allChecked);
        }
        this.updateCheckboxes(node.parentNode);
    },

    onLayerAdded: function(store, records, index) {
        // first, validate all 'group' options
        Ext.each(records, function(record, index) {
            var layer = record.getLayer();

            if(layer.displayInLayerSwitcher === false) {
                if(layer.group && layer.options && layer.options.group) {
                    delete layer.group;
                    delete layer.options.group;
                }
                return;
            } else if(layer.options && layer.options.group === undefined) {
                layer.options.group = (layer.isBaseLayer)
                    ? this.baseLayersText : this.otherLayersText;
            }
        }, this);

        // then, create the nodes according to the records
        Ext.each(records, function(record, index) {
            var layer = record.getLayer();

            if (layer.displayInLayerSwitcher === false) {
                return;
            }

            var groupString = layer.options.group || "";
            var group = groupString.split('/');

            // layers with group property set as empty string are added to
            // the root node
            if (groupString === "") {
                this.getRootNode().appendChild({
                    plugins: ['gx_layer'],
                    layer: layer,
                    text: layer.name
                });
            } else {
                this.addGroupNodes(
                    group, this.getRootNode(), groupString, record
                );
            }
        }, this);
    },

    addGroupNodes: function(groups, parentNode, groupString, layerRecord){
        var group = groups.shift(),
            childNode = this.getNodeByText(parentNode, group),
            layer = layerRecord.getLayer(),
            checkableNode = false;

        // if the childNode doesn't exist, we need to create and append it
        if (!childNode) {
            // if that's the last element of the groups array, we need a
            // 'LayerContainer'
            if (groups.length == 0) {
                childNode = {
                    expanded: (layer && layer.visibility),
                    plugins: [{
                        enableLegends: group != this.baseLayersText &&
                                       group != this.otherLayersText,
                        enableVectorLegends: this.enableVectorLegends,
                        enableWmsLegends: this.enableWmsLegends,
                        layerGroup: groupString,
                        ptype: 'gx_layergroupcontainer'
                    }],
                    text: group
                };
            } else {
                // else, create and append a simple node...
                childNode = {
                    allowDrag: false,
                    expanded: (layer && layer.visibility),
                    leaf: false,
                    text: group
                };
            }

            
            if (childNode.plugins && childNode.plugins[0] && childNode.plugins[0].pype == "gx_layergroupcontainer") {
                checkableNode = this.checkableLeafGroupNodes;
            } else {
                checkableNode = this.checkableContainerGroupNodes && this.checkableLeafGroupNodes;
            }

            // apply checkbox if option is set, set to checked by default - the
            // listener for the checkchange has already been set in initComponent
            if (checkableNode && group != this.baseLayersText &&
                group != this.otherLayersText && (!layer || !layer.isBaseLayer)) {
                childNode.checked = true;
            }
            parentNode.appendChild(childNode);

            childNode = this.getNodeByText(parentNode, group);
        }

        // if node contains any child or grand-child with a visible layer,
        // expand it, else if it contains any child or grand-child with a
        // non-visible layer and it can have a checkbox, uncheck it
        if (layer && layer.visibility) {
            window.setTimeout(function() {
                childNode.expand();
            });
        } else if(checkableNode && group != this.baseLayersText &&
            group != this.otherLayersText && (!layer || !layer.isBaseLayer)) {
            childNode.data.checked = false;
        }

        if (groups.length != 0){
            this.addGroupNodes(groups, childNode, groupString, layerRecord);
        }
    },

    getNodeByText: function(node, text){
        for(var i=0; i<node.childNodes.length; i++)
        {
            if(node.childNodes[i].data['text'] == text)
            {
                return node.childNodes[i];
            }
        }
        return false;
    }
});
