Ext.define('GeoExt.panel.Legend', {
    extend : 'Ext.panel.Panel',
    requires : [
    //    'GeoExt.data.LayerStore'
    ],
    alias : 'widget.gx_legendpanel',
    alternateClassName : 'GeoExt.LegendPanel',
    
    statics : {
        guess : function() {
            var candidates = Ext.ComponentQuery.query("gx_legendpanel");
            return ((candidates && candidates.length > 0) 
                ? candidates[0] 
                : null);
        }
    },
    
    /** api: config[dynamic]
     *  ``Boolean``
     *  If false the LegendPanel will not listen to the add, remove and change 
     *  events of the LayerStore. So it will load with the initial state of
     *  the LayerStore and not change anymore. 
     */
    dynamic: true,
    
    /** api: config[layerStore]
     *  ``GeoExt.data.LayerStore``
     *  The layer store containing layers to be displayed in the legend 
     *  container. If not provided it will be taken from the MapPanel.
     */
    layerStore: null,
    
    /** api: config[preferredTypes]
     *  ``Array(String)`` An array of preferred legend types.
     */
    
    /** private: property[preferredTypes]
     */
    preferredTypes: null,
    
    initComponent: function(){
        var me = this;
//        console.log('initComponent Legend');
        me.callParent(arguments);
           
    },
    /** api: config[filter]
     *  ``Function``
     *  A function, called in the scope of the legend panel, with a layer record
     *  as argument. Is expected to return true for layers to be displayed, false
     *  otherwise. By default, all layers will be displayed.
     *
     *  .. code-block:: javascript
     *
     *      filter: function(record) {
     *          return record.getLayer().isBaseLayer;
     *      }
     */
    filter: function(record) {
        return true;
    }, 
    /** private: method[onRender]
     *  Private method called when the legend panel is being rendered.
     */
    onRender: function() {
        this.callParent(arguments);
    
        if(!this.layerStore) {
            this.layerStore = GeoExt.panel.Map.guess().getLayers();
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

    /** private: method[recordIndexToPanelIndex]
     *  Private method to get the panel index for a layer represented by a
     *  record.
     *
     *  :param index ``Integer`` The index of the record in the store.
     *
     *  :return: ``Integer`` The index of the sub panel in this panel.
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
//            console.log(i);
            var types = GeoExt.legend.Layer.getTypes(record);
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
    
    /** private: method[getIdForLayer]
     *  :arg layer: ``OpenLayers.Layer``
     *  :returns: ``String``
     *
     *  Generate an element id that is unique to this panel/layer combo.
     */
    getIdForLayer: function(layer) {
        return this.id + "-" + layer.id;
    },

    /** private: method[onStoreAdd]
     *  Private method called when a layer is added to the store.
     *
     *  :param store: ``Ext.data.Store`` The store to which the record(s) was 
     *      added.
     *  :param record: ``Ext.data.Record`` The record object(s) corresponding
     *      to the added layers.
     *  :param index: ``Integer`` The index of the inserted record.
     */
    onStoreAdd: function(store, records, index) {
        var panelIndex = this.recordIndexToPanelIndex(index+records.length-1);
        for (var i=0, len=records.length; i<len; i++) {
            this.addLegend(records[i], panelIndex);
        }
        this.doLayout();
    },

    /** private: method[onStoreRemove]
     *  Private method called when a layer is removed from the store.
     *
     *  :param store: ``Ext.data.Store`` The store from which the record(s) was
     *      removed.
     *  :param record: ``Ext.data.Record`` The record object(s) corresponding
     *      to the removed layers.
     *  :param index: ``Integer`` The index of the removed record.
     */
    onStoreRemove: function(store, record, index) {
        this.removeLegend(record);            
    },

    /** private: method[removeLegend]
     *  Remove the legend of a layer.
     *  :param record: ``Ext.data.Record`` The record object from the layer 
     *      store to remove.
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

    /** private: method[onStoreClear]
     *  Private method called when a layer store is cleared.
     *
     *  :param store: ``Ext.data.Store`` The store from which was cleared.
     */
    onStoreClear: function(store) {
        this.removeAllLegends();
    },

    /** private: method[removeAllLegends]
     *  Remove all legends from this legend panel.
     */
    removeAllLegends: function() {
        this.removeAll(true);
        this.doLayout();
    },

    /** private: method[addLegend]
     *  Add a legend for the layer.
     *
     *  :param record: ``Ext.data.Record`` The record object from the layer 
     *      store.
     *  :param index: ``Integer`` The position at which to add the legend.
     */
    addLegend: function(record, index) {
        if (this.filter(record) === true) {
            var layer = record.getLayer();
            index = index || 0;
            var legend;
            var types = GeoExt.legend.Layer.getTypes(record, this.preferredTypes);
//            console.log(types[0]);
            if(layer.displayInLayerSwitcher && !record.get('hideInLegend') && types.length > 0) {
                this.insert(index,       {
                    xtype: types[0],
                    id: this.getIdForLayer(layer),
                    layerRecord: record,
                    hidden: !((!layer.map && layer.visibility) ||
                        (layer.getVisibility() && layer.calculateInRange()))
                });
        
                /*
      {
          xtype: types[0],
          id: this.getIdForLayer(layer),
          layerRecord: record,
          hidden: !((!layer.map && layer.visibility) ||
            (layer.getVisibility() && layer.calculateInRange()))
        }
              */
//                console.log(this);
            }
        }
    },

    /** private: method[onDestroy]
     *  Private method called during the destroy sequence.
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

