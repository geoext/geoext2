/**
 * @requires GeoExt/data/LayerModel.js
 */

/**
 * @class GeoExt.data.LayerStore
 */
Ext.define('GeoExt.data.LayerStore', {
    require: ['GeoExt.data.LayerModel'],
    extend: 'Ext.data.Store',
    model: 'GeoExt.data.LayerModel',

    /**
     * @cfg {OpenLayers.Map/GeoExt.panel.Map/Object} map
     *  Map that this store will be in sync with. If not provided, the
     *  store will not be bound to a map.
     */
        
    /** 
     * @property {OpenLayers.Map/Object} map
     *  Map that the store is synchronized with, if any.
     */
    map: null,
        
    /** 
     * @cfg {OpenLayers.Layer/Array} layers
     *  Layers that will be added to the store (and the map, depending on the
     *  value of the ``initDir`` option.
     */
        
    /** 
     * @cfg {Number} initDir
     *  Bitfields specifying the direction to use for the initial sync between
     *  the map and the store, if set to 0 then no initial sync is done.
     *  Defaults to ``GeoExt.data.LayerStore.MAP_TO_STORE|GeoExt.data.LayerStore.STORE_TO_MAP``
     */

    /** 
     * @config {Object} Creation parameters
     * @private
     */
    construction: function(config) {
        var me = this;

        config = Ext.apply({}, config);

        // "map" option
        var map = config.map instanceof GeoExt.MapPanel ?
            config.map.map : config.map;
        delete config.map;

        // "layers" option - is an alias to "data" option
        if(config.layers) {
            config.data = config.layers;
        }
        delete config.layers;

        // "initDir" option
        var options = {initDir: config.initDir};
        delete config.initDir;

        me.callParent(config);

        /**
         * @event bind
         *  Fires when the store is bound to a map.
         *
         *  Listener arguments:
         *  * :class:`GeoExt.data.LayerStore`
         *  * ``OpenLayers.Map``
         */
            
        if(map) {
            this.bind(map, options);
        }

        me.callParent(config);
    },

    /**
     *  Bind this store to a map instance, once bound the store
     *  is synchronized with the map and vice-versa.
     *
     *  @param map: ``OpenLayers.Map`` The map instance.
     *  @param options: ``Object``  
     */
    bind: function(map, options) {
        var me = this;

        if(me.map) {
            // already bound
            return;
        }
        me.map = map;
        options = Ext.apply({}, options);

        var initDir = options.initDir;
        if(options.initDir == undefined) {
            initDir = GeoExt.data.LayerStore.MAP_TO_STORE |
                GeoExt.data.LayerStore.STORE_TO_MAP;
        }

        // create a snapshot of the map's layers
        var layers = map.layers.slice(0);

        if(initDir & GeoExt.data.LayerStore.STORE_TO_MAP) {
            me.each(function(record) {
                    me.map.addLayer(record.getLayer());
                }, me);
        }
        if(initDir & GeoExt.data.LayerStore.MAP_TO_STORE) {
            me.loadData(layers, true);
        }

        map.events.on({
            "changelayer": me.onChangeLayer,
            "addlayer": me.onAddLayer,
            "removelayer": me.onRemoveLayer,
            scope: me
        });
        me.on({
            "load": me.onLoad,
            "clear": me.onClear,
            "add": me.onAdd,
            "remove": me.onRemove,
            "update": me.onUpdate,
            scope: me
        });
        me.data.on({
            "replace" : me.onReplace,
            scope: me
        });
        me.fireEvent("bind", me, map);
    },

    /**
     * api: method[unbind]
     *  Unbind this store from the map it is currently bound.
     */
    unbind: function() {
        var me = this;

        if(me.map) {
            me.map.events.un({
                "changelayer": me.onChangeLayer,
                "addlayer": me.onAddLayer,
                "removelayer": me.onRemoveLayer,
                scope: me
            });
            me.un("load", me.onLoad, me);
            me.un("clear", me.onClear, me);
            me.un("add", me.onAdd, me);
            me.un("remove", me.onRemove, me);

            me.data.un("replace", me.onReplace, me);

            me.map = null;
        }
    }
});
