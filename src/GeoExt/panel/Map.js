/**
 * @class GeoExt.panel.Map
 * 
 * Create a panel container for a map. The map contained by this panel
 * will initially be zoomed to either the center and zoom level configured
 * by the ``center`` and ``zoom`` configuration options, or the configured
 * ``extent``, or - if neither are provided - the extent returned by the
 * map's ``getExtent()`` method.
 * 
 *     @example
 *     var mappanel = Ext.create('GeoExt.panel.Map', {
 *         title: 'A sample Map',
 *         map: {
 *             // ...
 *             // optional, can be either
 *             //   - a valid OpenLayers.Map configuration or
 *             //   - an instance of OpenLayers.Map
 *         },
 *         center: '12.31,51.48',
 *         zoom: 6
 *     });
 * 
 * A Map created with code like above is then ready to use as any other panel. 
 * To have a fullscrteen map application, you could e.g. add it to a viewport:
 * 
 *     @example
 *     Ext.create('Ext.container.Viewport', {
 *         layout: 'fit',
 *         items: [
 *             mappanel // our variable from above
 *         ]
 *      });
 */
Ext.define('GeoExt.panel.Map', {
    extend : 'Ext.panel.Panel',
    requires : ['GeoExt.data.LayerStore'],
    alias : 'widget.gx_mappanel',
    alternateClassName : 'GeoExt.MapPanel',
    
    statics : {
        /**
         * @return {GeoExt.panel.Map} 
         * @static
         * 
         * The first map panel found via an  the Ext.ComponentQuery.query 
         * manager.
         *  
         * Convenience function for guessing the map panel of an application. 
         * This can reliably be used for all applications that just have one map
         * panel in the viewport.
         */
        guess : function() {
            var candidates = Ext.ComponentQuery.query("gx_mappanel");
            return ((candidates && candidates.length > 0) 
                ? candidates[0] 
                : null);
        }
    },
    
    /** @cfg {OpenLayers.LonLat/Number[]/String} center
     * A location for the initial map center.  If an array is provided, the
     * first two items should represent x & y coordinates. If a string is
     * provided, it should consist of a x & y coordinate seperated by a 
     * comma.
     */
    center: null,
    
    /**
     * @cfg {Number} zoom
     * An initial zoom level for the map.
     */
    zoom: null,
    
    /**
     * @cfg {OpenLayers.Bounds/Number[]} extent
     * An initial extent for the map (used if center and zoom are not
     * provided.  If an array, the first four items should be minx, miny,
     * maxx, maxy.
     */
    extent: null,
    
    /** 
     * @cfg {Boolean} prettyStateKeys
     * Set this to true if you want pretty strings in the MapPanel's state
     * keys. More specifically, layer.name instead of layer.id will be used
     * in the state keys if this option is set to true. But in that case
     * you have to make sure you don't have two layers with the same name.
     * Defaults to false.
     */
    /** 
     * @property {Boolean} prettyStateKeys
     * Whether we want the state key to be pretty. See 
     * {@link #cfg-prettyStateKeys the config option prettyStateKeys} for 
     * details.
     */
    prettyStateKeys: false,
    
    /**
     * @cfg {OpenLayers.Map/Object} map
     * A configured map or a configuration object for the map constructor.
     * A configured map will be available after construction through the
     * {@link #property-map} property.
     */
    /** 
     * @property {OpenLayers.Map/Object} map 
     * A map or map configuration.
     */
    map: null,
    
    /**
     * @cfg {GeoExt.data.LayerStore/OpenLayers.Layer[]} layers
     * The layers provided here will be added to this Map's 
     * {@link #property-map}.
     */
    /**
     * @property {GeoExt.data.LayerStore} layers
     * A store containing {@link GeoExt.data.LayerModel gx_layer-model} 
     * instances.
     */
    layers: null,
    
    /**
     * @property {String[]} stateEvents
     * @private
     * Array of state events
     */
    stateEvents: [
        "aftermapmove",
        "afterlayervisibilitychange",
        "afterlayeropacitychange",
        "afterlayerorderchange",
        "afterlayernamechange"
    ],
    
    /**
     * Initializes the map panel. Creates an OpenLayers map if
     * none was provided in the config options passed to the
     * constructor.
     * 
     * @private
     */
    initComponent: function(){
        var me = this;
        
        // check config-property map for an existing OpenLayers.Map-instance, a
        // conf object for an OpenLayers.Map or null
        if ( !(me.map instanceof OpenLayers.Map) ) {
            var mapConf = Ext.applyIf(me.map || {}, {
                allOverlays: true,
                controls: me.initialConfig.controls || me.getDefaultControls()
            });
            me.map = new OpenLayers.Map(mapConf);
        } else {
            // add any additionally configured controls:
            if (me.initialConfig.controls) {
                me.map.addControls(me.initialConfig.controls);
            }
        }
        // this.map is now initialized in any case and has needed and
        // configured controls
        
        // check config-property layers for any layers to be added to the map
        if ( me.layers ) {
            // normalize the case where this.layers was not an array but a layer 
            if(me.layers instanceof OpenLayers.Layer) {
                me.layers = [me.layers];
            }
            
            //TODO: this possibly requests data from the layers to early
            // we might move this e.g. to the renderMap-method
            me.map.addLayers(me.layers);
            
        }

        // create a layerstore with the current maps layers
        me.layers = Ext.create('GeoExt.data.LayerStore', {
            map: me
        });
        
        // check config-property controls
        if ( me.controls ) {
            // normalize the case where this.controls was not an array but a control 
            if(me.controls instanceof OpenLayers.Control) {
                me.controls = [me.controls];
            }
            me.map.addControls(me.controls);
        }
        
        // check config-property center
        if ( Ext.isString(me.center) ) {
            me.center = OpenLayers.LonLat.fromString(me.center);
        } else if(Ext.isArray(me.center)) {
            // see: http://trac.osgeo.org/openlayers/ticket/3433
            // me.center = OpenLayers.LonLat.fromArray(me.center);
            me.center = new OpenLayers.LonLat(me.center[0], me.center[1]); 
        } 
        
        // check config-property bounds
        if ( Ext.isString(me.extent) ) {
            me.extent = OpenLayers.Bounds.fromString(me.extent);
        } else if(Ext.isArray(me.extent)) {
            me.extent = OpenLayers.Bounds.fromArray(me.extent);
        }
        
        me.callParent(arguments);
        
        // bind various listeners to the corresponding OpenLayers.Map-events
        me.map.events.on({
            "moveend": me.onMoveend,
            "changelayer": me.onChangelayer,
            "addlayer": me.onAddlayer,
            "removelayer": me.onRemovelayer,
            scope: me
        });
        
        /**
         * @event aftermapmove
         * Fires after the map is moved.
         */
        /**
         * @event afterlayervisibilitychange
         * Fires after a layer changed visibility.
         */
        /**
         * @event afterlayeropacitychange
         * Fires after a layer changed opacity.
         */
        /**
         * @event afterlayerorderchange
         * Fires after a layer order changed.
         */
        /**
         * @event afterlayernamechange
         * Fires after a layer name changed.
         */
        
        //TODO This should be handled by a LayoutManager
        this.on("afterlayout", function() {
            //TODO remove function check when we require OpenLayers > 2.11
            if (typeof this.map.getViewport === "function") {
                this.items.each(function(cmp) {
                    if (typeof cmp.addToMapPanel === "function") {
                        cmp.getEl().appendTo(this.map.getViewport());
                    }
                }, this);
            }
        }, this);
    },
    
    /**
     * @private
     * 
     * Returns the an array of default controls for autocreated OpenLayers.Map
     * instances. Will give the autocreated controls the following controls:
     * 
     * * [OpenLayers.Control.Attribution](http://dev.openlayers.org/releases/OpenLayers-2.11/doc/apidocs/files/OpenLayers/Control/Attribution-js.html)
     * * [OpenLayers.Control.ArgParser](http://dev.openlayers.org/releases/OpenLayers-2.11/doc/apidocs/files/OpenLayers/Control/ArgParser-js.html)
     * * [OpenLayers.Control.Navigation](http://dev.openlayers.org/releases/OpenLayers-2.11/doc/apidocs/files/OpenLayers/Control/Navigation-js.html)
     */
    getDefaultControls: function() {
        var olc = OpenLayers.Control;
        return [
            new olc.Attribution(),
            new olc.ArgParser(),
            new olc.Navigation()
        ];
    },
    
    /**
     * @private
     * Private method called after the panel has been rendered.
     */
    afterRender: function(){
        var me = this;
        me.callParent(arguments);
        if(!me.ownerCt) {
            me.renderMap();
        } else {
            this.ownerCt.on("move", me.updateMapSize, me);
            this.ownerCt.on({
                "afterlayout": me.renderMap,
                scope: me
            });
        }
    },
    
    /**
     * @private
     * Tell the map that it needs to recalculate its size and position.
     */
    updateMapSize: function() {
        var map = this.map;
        if(map) {
            map.updateSize();
        }
    },
    
    /**
     * @private
     * Adjust the geographic position of the map according to the defined center
     * and/or zoom, the defined extent or the #map's maxExtent. 
     */
    adjustGeographicPosition: function(){
        var me = this,
            map = me.map;
        // Adjust the geographic position according to the passed config-options 
        if (!map.getCenter()) {
            if (me.center || me.zoom ) {
                // center and/or zoom?
                map.setCenter(me.center, me.zoom);
            } else if (me.extent instanceof OpenLayers.Bounds) {
                // extent
                map.zoomToExtent(me.extent, true);
            }else { 
                map.zoomToMaxExtent();
            }    
        }
    },
    
    /**
     * @private
     * Private method called after the panel has been rendered or after it
     * has been laid out by its parent's layout.
     */
    renderMap: function() {
        var me = this,
            map = me.map;
        if (me.hasRenderableSize()) {
            map.render(me.body.dom);
            me.adjustGeographicPosition();
        }
    },
    
    /**
     * @private
     * 
     * Determines whether we have a size we can render the map into.
     */
    hasRenderableSize: function() {
        var me = this,
            size = me.getSize(),
            width = (size.width === 0) 
                  ? 0 
                  : size.width - me.body.getBorderWidth("lr"),
            height = (size.height === 0) 
                  ? 0 
                  : size.height - me.body.getBorderWidth("tb");
        return (width > 0 || height > 0);
        
    },
    
    /**
     * @private
     * The "moveend" listener bound to the {@link map}.
     */
    onMoveend: function(e) {
        this.fireEvent("aftermapmove", this, this.map, e);
    },

    /**
     * @private
     * @param {Object} e
     * The "changelayer" listener bound to the {@link map}.
     */
    onChangelayer: function(e) {
        var me = this,
            map = me.map;
        if (e.property) {
            if (e.property === "visibility") {
                me.fireEvent("afterlayervisibilitychange", this, map, e);
            } else if (e.property === "order") {
                me.fireEvent("afterlayerorderchange", this, map, e);
            } else if (e.property === "name") {
                me.fireEvent("afterlayernamechange", this, map, e);
            } else if (e.property === "opacity") {
                me.fireEvent("afterlayeropacitychange", this, map, e);
            }
        }
    },

    /**
     * @private
     * @return {Object} 
     * Returns a state of the Map as keyed Object. Depending on the point in 
     * time this methoid is being called, the following keys will be available:
     * 
     * * `x`
     * * `y`
     * * `zoom`
     * 
     * And for all layers present in the map the object will contain the 
     * following keys
     * 
     * * `visibility_<XXX>`
     * * `opacity_<XXX>`
     * 
     * The <XXX> suffix is either the title or id of the layer record, it can be 
     * influenced by setting #prettyStateKeys to `true` or `false`.
     */
    getState: function() {
        var me = this,
            map = me.map,
            state = me.callParent(arguments) || {},
            layer;

        // Ext delays the call to getState when a state event
        // occurs, so the MapPanel may have been destroyed
        // between the time the event occurred and the time
        // getState is called
        if(!map) {
            return;
        }

        // record location and zoom level
        var center = map.getCenter();
        // map may not be centered yet, because it may still have zero
        // dimensions or no layers
        center && Ext.applyIf(state, {
            "x": center.lon,
            "y": center.lat,
            "zoom": map.getZoom()
        });
        
        me.layers.each(function(modelInstance) {
            layer = modelInstance.getLayer();
            layerId = this.prettyStateKeys 
                   ? modelInstance.get('title') 
                   : modelInstance.get('id');
            state = me.addPropertyToState(state, "visibility_" + layerId, 
                layer.getVisibility());
            state = me.addPropertyToState(state, "opacity_" + layerId, 
                (layer.opacity === null) ? 1 : layer.opacity);
        }, me);
        
        return state;  
    },
    
    /**
     * @private
     * @param {Object} state The state to apply.
     * Apply the state provided as an argument.
     */
    applyState: function(state) {
        var me = this;
            map = me.map;
        // if we get strings for state.x, state.y or state.zoom
        // OpenLayers will take care of converting them to the
        // appropriate types so we don't bother with that
        me.center = new OpenLayers.LonLat(state.x, state.y);
        me.zoom = state.zoom;
        
        // TODO refactor with me.layers.each
        // set layer visibility and opacity
        var i, l, layer, layerId, visibility, opacity;
        var layers = map.layers;
        for(i=0, l=layers.length; i<l; i++) {
            layer = layers[i];
            layerId = me.prettyStateKeys ? layer.name : layer.id;
            visibility = state["visibility_" + layerId];
            if(visibility !== undefined) {
                // convert to boolean
                visibility = (/^true$/i).test(visibility);
                if(layer.isBaseLayer) {
                    if(visibility) {
                        map.setBaseLayer(layer);
                    }
                } else {
                    layer.setVisibility(visibility);
                }
            }
            opacity = state["opacity_" + layerId];
            if(opacity !== undefined) {
                layer.setOpacity(opacity);
            }
        }
    },

    
    /**
     * @private
     * Private method called during the destroy sequence.
     */
    beforeDestroy: function() {
        me = this;
        if(this.ownerCt) {
            this.ownerCt.un("move", this.updateMapSize, this);
        }
        if(this.map && this.map.events) {
            this.map.events.un({
                "moveend": this.onMoveend,
                "changelayer": this.onChangelayer,
                "addlayer": this.onAddlayer,
                "removelayer": this.onRemovelayer,
                scope: this
            });
        }
        // if the map panel was passed a map instance, this map instance
        // is under the user's responsibility
        if(!this.initialConfig.map ||
           !(this.initialConfig.map instanceof OpenLayers.Map)) {
            // we created the map, we destroy it
            if(this.map && this.map.destroy) {
                this.map.destroy();
            }
        }
        delete this.map;
        me.callParent(arguments);
    }
});
