Ext.define('GeoExt.legend.Layer', {
    extend : 'Ext.container.Container',
    requires : [
    //    'GeoExt.data.LayerStore'
    ],
    alias : 'widget.gx_layerlegend',
    alternateClassName : 'GeoExt.LayerLegend',
    
    statics : {
        guess : function() {
            var candidates = Ext.ComponentQuery.query("gx_layerlegend");
            return ((candidates && candidates.length > 0) 
                ? candidates[0] 
                : null);
        },
        getTypes: function(layerRecord, preferredTypes) {
            var types = (preferredTypes || []).concat();
            var goodTypes = [];
            console.log('types',GeoExt.legend.Layer.types);
            for(var type in GeoExt.legend.Layer.types) {
                if(GeoExt.legend.Layer.types[type].supports(layerRecord)) {
                    // add to goodTypes if not preferred
                    types.indexOf(type) == -1 && goodTypes.push(type);
                } else {
                    // preferred, but not supported
                    Ext.Array.remove(types, type);
                }
            }
            // take the remaining preferred types, and add other good types 
            return types.concat(goodTypes);
        },
        supports: function(layerRecord) {
        // to be implemented by subclasses
        },
        types: []
    },

    /** api: config[layerRecord]
     *  :class:`GeoExt.data.LayerRecord`  The layer record for the legend
     */
    layerRecord: null,

    /** api: config[showTitle]
     *  ``Boolean``
     *  Whether or not to show the title of a layer. This can be overridden
     *  on the LayerStore record using the hideTitle property.
     */
    showTitle: true,
    
    /** api: config[legendTitle]
     *  ``String``
     *  Optional title to be displayed instead of the layer title.  If this is
     *  set, the value of ``showTitle`` will be ignored (assumed to be true).
     */
    legendTitle: null,

    /** api: config[labelCls]
     *  ``String``
     *  Optional css class to use for the layer title labels.
     */
    labelCls: null,
    
    /** private: property[layerStore]
     *  :class:`GeoExt.data.LayerStore`
     */
    layerStore: null,
    
    initComponent: function(){
        var me = this;
        
        me.callParent(arguments);
        me.autoEl = {};
        me.add({
            xtype: "label",
            text: this.getLayerTitle(this.layerRecord),
            cls: 'x-form-item x-form-item-label' +
            (this.labelCls ? ' ' + this.labelCls : '')
        });
        if (me.layerRecord && me.layerRecord.store) {
            me.layerStore = me.layerRecord.store;
            me.layerStore.on("update", me.onStoreUpdate, me);
        }
 
    },
    
    /** private: method[onStoreUpdate]
     *  Update a the legend. Gets called when the store fires the update event.
     *  This usually means the visibility of the layer, its style or title
     *  has changed.
     *
     *  :param store: ``Ext.data.Store`` The store in which the record was
     *      changed.
     *  :param record: ``Ext.data.Record`` The record object corresponding
     *      to the updated layer.
     *  :param operation: ``String`` The type of operation.
     */
    onStoreUpdate: function(store, record, operation) {
        // if we don't have items, we are already awaiting garbage
        // collection after being removed by LegendPanel::removeLegend, and
        // updating will cause errors
        if (record === this.layerRecord && this.items.getCount() > 0) {
            var layer = record.getLayer();
            this.setVisible(layer.getVisibility() &&
                layer.calculateInRange() && layer.displayInLayerSwitcher &&
                !record.get('hideInLegend'));
            this.update();
        }
    },

    /** private: method[update]
     *  Updates the legend.
     */
    update: function() {
        var title = this.getLayerTitle(this.layerRecord);
        var item = this.items.get(0);
        if (item instanceof Ext.form.Label && item.text !== title) {
            // we need to update the title
            item.setText(title);
        }
    },
    
    /** private: method[getLayerTitle]
     *  :arg record: :class:GeoExt.data.LayerRecord
     *  :returns: ``String``
     *
     *  Get a title for the layer.  If the record doesn't have a title, use the 
     *  name.
     */
    getLayerTitle: function(record) {
        var title = this.legendTitle || "";

        if (this.showTitle && !title) {
            if (record && !record.get("hideTitle")) {
                title = record.get("title") || 
                record.get("name") || 
                record.getLayer().name || "";
            }
        }
        return title;
    },
    
    /** private: method[beforeDestroy]
     */
    beforeDestroy: function() {
        this.layerStore &&
        this.layerStore.un("update", this.onStoreUpdate, this);
        this.callParent(arguments);
    },

    /** private: method[onDestroy]
     */
    onDestroy: function() {
        this.layerRecord = null;
        this.layerStore = null;
        this.callParent(arguments);
    }
});