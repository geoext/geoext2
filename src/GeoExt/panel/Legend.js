/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include GeoExt/container/LayerLegend.js
 */

/**
 *  A panel showing legends of all layers in a layer store.
 *  Depending on the layer type, a legend renderer will be chosen.
 *
 *  The LegendPanel will include legends for all the layers in the
 *  ``layerStore`` it is configured with, unless the layer is configured with
 *  ``displayInLayerSwitcher: false``, or a layer record has a
 *  ``hideInLegend`` field with a value of ``true``. Additional filtering can
 *  be done by configuring a ``filter`` on the LegendPanel.
 * @class GeoExt.panel.Legend
 */
Ext.define('GeoExt.panel.Legend', {
    extend : 'Ext.panel.Panel',
    requires: ['GeoExt.container.LayerLegend'],
    alias : 'widget.gx_legendpanel',
    alternateClassName : 'GeoExt.LegendPanel',

    /**
     * @cfg {Boolean} dynamic
     * If false the LegendPanel will not listen to the add, remove and change 
     * events of the LayerStore. So it will load with the initial state of
     * the LayerStore and not change anymore. 
     */
    dynamic: true,

    /**
     * @cfg {Ext.data.Store} layerStore
     * The layer store containing layers to be displayed in the legend 
     * container. If not provided it will be taken from the MapPanel.
     */
    layerStore: null,

    /**
     * @cfg {Array}
     * An array of preferred legend types.
     */
    preferredTypes: null,

    /**
     * @cfg {Function}
     * A function, called in the scope of the legend panel, with a layer record
     * as argument. Is expected to return true for layers to be displayed, false
     * otherwise. By default, all layers will be displayed.
     */
    filter: function(record) {
        return true;
    },    

    /**
     * Private method called when the legend panel is being rendered.
     * @private
     */    
    onRender: function() {
        this.callParent(arguments);
    
        if(!this.layerStore) {
            this.layerStore = GeoExt.panel.Map.guess().layers;
        }
        this.layerStore.each(function(record) {
            this.addLegend(record);
        }, this);
        if (this.dynamic) {
            this.layerStore.on({
                "add": this.onStoreAdd,
                "remove": this.onStoreRemove,
                "clear": this.onStoreClear,
                scope: this
            });
        }
    },

    /** 
     * Private method to get the panel index for a layer represented by a
     * record.
     * @private
     * @param {Integer} index The index of the record in the store.
     * @return {Integer} The index of the sub panel in this panel.
     */
    recordIndexToPanelIndex: function(index) {
        var store = this.layerStore;
        var count = store.getCount();
        var panelIndex = -1;
        var legendCount = this.items ? this.items.length : 0;
        var record, layer;
        for(var i=count-1; i>=0; --i) {
            record = store.getAt(i);
            layer = record.getLayer();
            var types = GeoExt.container.LayerLegend.getTypes(record);
            if(layer.displayInLayerSwitcher && types.length > 0 &&
                (store.getAt(i).get("hideInLegend") !== true)) {
                ++panelIndex;
                if(index === i || panelIndex > legendCount-1) {
                    break;
                }
            }
        }
        return panelIndex;
    },
    
    /**
     * Generate an element id that is unique to this panel/layer combo.
     * @private
     * @param {OpenLayers.Layer} layer
     * @returns {String}
     */
    getIdForLayer: function(layer) {
        return this.id + "-" + layer.id;
    },

    /** 
     * Private method called when a layer is added to the store.
     * @private
     * @param {Ext.data.Store} store The store to which the record(s) was 
     * added.
     * @param {Ext.data.Record} record The record object(s) corresponding
     * to the added layers.
     * @param {Integer} index The index of the inserted record.
     */
    onStoreAdd: function(store, records, index) {
        var panelIndex = this.recordIndexToPanelIndex(index+records.length-1);
        for (var i=0, len=records.length; i<len; i++) {
            this.addLegend(records[i], panelIndex);
        }
        this.doLayout();
    },

    /** 
     * Private method called when a layer is removed from the store.
     * @private
     * @param {Ext.data.Store} store The store from which the record(s) was
     * removed.
     * @param {Ext.data.Record} record The record object(s) corresponding
     * to the removed layers.
     * @param {Integer} index The index of the removed record.
     */
    onStoreRemove: function(store, record, index) {
        this.removeLegend(record);            
    },

    /** 
     * Remove the legend of a layer.
     * @private
     * @param {Ext.data.Record} record The record object from the layer 
     * store to remove.
     */
    removeLegend: function(record) {
        if (this.items) {
            var legend = this.getComponent(this.getIdForLayer(record.getLayer()));
            if (legend) {
                this.remove(legend, true);
                this.doLayout();
            }
        }
    },

    /** 
     * Private method called when a layer store is cleared.
     * @private
     * @param {Ext.data.Store} store The store from which was cleared.
     */
    onStoreClear: function(store) {
        this.removeAllLegends();
    },

    /**
     * Remove all legends from this legend panel.
     * @private
     */
    removeAllLegends: function() {
        this.removeAll(true);
        this.doLayout();
    },

    /**
     * Add a legend for the layer.
     * @private
     * @param {Ext.data.Record} record The record object from the layer 
     * store.
     * @param {Integer} index The position at which to add the legend.
     */
    addLegend: function(record, index) {
        if (this.filter(record) === true) {
            var layer = record.getLayer();
            index = index || 0;
            var legend;
            var types = GeoExt.container.LayerLegend.getTypes(record, this.preferredTypes);
            if(layer.displayInLayerSwitcher && !record.get('hideInLegend') && types.length > 0) {
                this.insert(index,       {
                    xtype: types[0],
                    id: this.getIdForLayer(layer),
                    layerRecord: record,
                    hidden: !((!layer.map && layer.visibility) ||
                        (layer.getVisibility() && layer.calculateInRange()))
                });
            }
        }
    },

    /**
     * Private method called during the destroy sequence.
     * @private
     */
    onDestroy: function() {
        if(this.layerStore) {
            this.layerStore.un("add", this.onStoreAdd, this);
            this.layerStore.un("remove", this.onStoreRemove, this);
            this.layerStore.un("clear", this.onStoreClear, this);
        }
        this.callParent(arguments);
    }
 
});
