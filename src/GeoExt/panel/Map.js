/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @requires GeoExt/data/LayerStore.js
 */

/**
 * Create a panel container for a map. The map contained by this panel
 * will initially be zoomed to either the center and zoom level configured
 * by the `center` and `zoom` configuration options, or the configured
 * `extent`, or - if neither are provided - the extent returned by the
 * map projection's `getExtent()` method.
 *
 * Example:
 *
 *     var mappanel = Ext.create('GeoExt.panel.Map', {
 *         title: 'A sample Map',
 *         map: {
 *             // ...
 *             // optional, can be either
 *             //   - a valid ol.Map configuration or
 *             //   - an instance of ol.Map
 *         },
 *         center: '12.31,51.48',
 *         zoom: 6
 *     });
 *
 * A Map created with code like above is then ready to use as any other panel.
 * To have a fullscreen map application, you could e.g. add it to a viewport:
 *
 * Example:
 *
 *     Ext.create('Ext.container.Viewport', {
 *         layout: 'fit',
 *         items: [
 *             mappanel // our variable from above
 *         ]
 *     });
 *
 * @class GeoExt.panel.Map
 */
Ext.define('GeoExt.panel.Map', {
    extend: 'Ext.panel.Panel',
    requires: [
        'GeoExt.data.LayerStore'
    ],
    alias: 'widget.gx_mappanel',
    alternateClassName: 'GeoExt.MapPanel',

    statics: {
        /**
         * The first map panel found via an the Ext.ComponentQuery.query
         * manager.
         *
         * Convenience function for guessing the map panel of an application.
         * This can reliably be used for all applications that just have one map
         * panel in the viewport.
         *
         * @return {GeoExt.panel.Map}
         * @static
         */
        guess : function() {
            var candidates = Ext.ComponentQuery.query("gx_mappanel");
            return ((candidates && candidates.length > 0)
                ? candidates[0]
                : null);
        }
    },

    /**
     * A location for the initial map center.  If an array is provided, the
     * first two items should represent x & y coordinates. If a string is
     * provided, it should consist of an x & y coordinate seperated by a
     * comma.
     *
     * @cfg {Number[]/String} center
     */
    center: null,

    /**
     * An initial zoom level for the map.
     *
     * @cfg {Number} zoom
     */
    zoom: null,

    /**
     * An initial extent for the map (used if center and zoom are not
     * provided.  If an array, the first four items should be minx, miny,
     * maxx, maxy.
     *
     * @cfg {Number[]} extent
     */
    extent: null,

    /**
     * A configured map or a configuration object for the map constructor.
     *
     * A configured map will be available after construction through the
     * {@link GeoExt.panel.Map#property-map} property.
     *
     * @cfg {ol.Map/Object} map
     */
    /**
     * A map or map configuration.
     *
     * @property {ol.Map/Object} map
     */
    map: null,

    /**
     * In order for child items to be correctly sized and positioned,
     * typically a layout manager must be specified through the layout
     * configuration option.
     *
     * @cfg {String} layout
     */
    /**
     * A layout or layout configuration.
     *
     * @property {String} layout
     */
    layout: 'fit',

    /**
     * The layers provided here will be added to this Map
     * {@link #property-map}.
     *
     * @cfg {GeoExt.data.LayerStore/ol.layer.Layer[]} layers
     */
    /**
     * A store containing {@link GeoExt.data.LayerModel gx_layer-model}
     * instances.
     *
     * @property {GeoExt.data.LayerStore} layers
     */
    layers: null,

    /**
     * Array of state events.
     *
     * @property {String[]} stateEvents
     * @private
     */
    stateEvents: [
        "aftermoveend",
        "afterlayeradd",
        "afterlayerremove",
        "afterlayernamechange",
        "afterlayeropacitychange",
        "afterlayervisibilitychange"
    ],

    /**
     * Whether we already rendered an ol.Map in this panel. Will be
     * updated in #onResize, after the first rendering happened.
     *
     * @property {Boolean} mapRendered
     * @private
     */
    mapRendered: false,

    /**
     * Initializes the map panel. Creates an ol.Map if
     * none was provided in the config options passed to the
     * constructor.
     *
     * @private
     */
    initComponent: function(){
        if(!(this.map instanceof ol.Map)) {
            this.map = this.map || {};
            Ext.applyIf(this.map, {
                view: new ol.View()
            });
            this.map = new ol.Map(this.map);
        }
        var layers  = this.layers;
        if(!layers || Ext.isArray(layers)) {
           if (Ext.isArray(layers)) {
               for (var i=0, ii=layers.length; i<ii; ++i) {
                   layers[i].on('propertychange', this.layerPropertyChange, this);
               }
           }
           this.layers = Ext.create('GeoExt.data.LayerStore', {
                layers: layers,
                map: this.map.getLayers().getLength() > 0 ? this.map : null
            });
        }
        if (Ext.isString(this.center)) {
            this.center = this.center.split(',').map(parseFloat);
        }
        if (Ext.isString(this.extent)) {
            this.extent = this.extent.split(',').map(parseFloat);
        }

        this.callParent(arguments);

        // The map is renderer and its size are updated when we receive
        // "resize" events.
        this.on('resize', this.onResize, this);
        this.map.getView().on("change:center", function(e) {
            this.fireEvent("aftermoveend", this, this.map, e);
        }, this);
        this.layers.on({
            'add': function(store, records) {
                for (var i=0, ii=records.length; i<ii; ++i) {
                    records[i].getLayer().on('propertychange', this.layerPropertyChange, this);
                }
                this.fireEvent("afterlayeradd");
            },
            'remove': function(store, record) {
                record.getLayer().un('propertychange', this.layerPropertyChange, this);
                this.fireEvent("afterlayerremove");
            },
            scope: this
        });
    },

    /**
     * Private method called after a layer's propertychange event has fired.
     *
     * @param {Object} evt The event object.
     * @private
     */
    layerPropertyChange: function(evt) {
        if (evt.key === 'title') {
            this.fireEvent("afterlayernamechange");
        } else if (evt.key === 'opacity') {
            this.fireEvent("afterlayeropacitychange");
        } else if (evt.key === 'visible') {
            this.fireEvent("afterlayervisibilitychange");
        }
    },

    /**
     * Private method called after the panel has been rendered or after it
     * has been laid out by its parent's layout.
     *
     * @private
     */
    onResize: function() {
        var map = this.map;
        if(!this.mapRendered && this.body.dom !== map.getTarget()) {
            // the map has not been rendered yet
            map.setTarget(this.body.dom);
            this.mapRendered = true;

            this.layers.bind(map);

            if (map.getLayers().getLength() > 0) {
                this.setInitialExtent();
            } else {
                this.layers.on("add", this.setInitialExtent, this,
                               {single: true});
            }
        } else {
            map.updateSize();
        }
    },

    /**
     * Set the initial extent of this panel's map.
     *
     * @private
     */
    setInitialExtent: function() {
        var map = this.map;
        if (!map.getView().getCenter()) {
            if (this.center || this.zoom ) {
                // center and/or zoom?
                map.getView().setCenter(this.center);
                map.getView().setZoom(this.zoom);
            } else if (this.extent) {
                // extent
                map.getView().fitExtent(this.extent, map.getSize());
            } else {
                map.getView().fitExtent(map.getView().getProjection().getExtent(), map.getSize());
            }
        }
    },

    /**
     * Returns a state of the Map as keyed Object. The following keys will be available:
     *
     * * `x`
     * * `y`
     * * `zoom`
     *
     * @return {Object}
     * @private
     */
    getState: function() {
        var me = this,
            map = me.map,
            state = me.callParent(arguments) || {};

        // Ext delays the call to getState when a state event
        // occurs, so the MapPanel may have been destroyed
        // between the time the event occurred and the time
        // getState is called
        if (!map) {
            return;
        }

        // record location and zoom level
        var center = map.getView().getCenter();
        // map may not be centered yet
        center && Ext.applyIf(state, {
            "x": center[0],
            "y": center[1],
            "zoom": map.getView().getZoom()
        });

        me.layers.each(function(modelInstance) {
            layer = modelInstance.getLayer();
            layerId = modelInstance.get('title');
            state = me.addPropertyToState(state, "visibility_" + layerId,
                layer.getVisible());
            state = me.addPropertyToState(state, "opacity_" + layerId,
                (layer.getOpacity() === undefined) ? 1 : layer.getOpacity());
        }, me);

        return state;
    },

    /**
     * Apply the state provided as an argument.
     *
     * @param {Object} state The state to apply.
     * @private
     */
    applyState: function(state) {
        var me = this;
            map = me.map;
        me.center = [state.x, state.y].map(parseFloat);
        me.zoom = parseFloat(state.zoom);
    },

    /**
     * Check if an added item has to take separate actions
     * to be added to the map.
     * See e.g. the GeoExt.slider.Zoom or GeoExt.slider.LayerOpacity
     *
     * @private
     */
    onBeforeAdd: function(item) {
        if(Ext.isFunction(item.addToMapPanel)) {
            item.addToMapPanel(this);
        }
        this.callParent(arguments);
    },

    /**
     * Private method called during the destroy sequence.
     *
     * @private
     */
    beforeDestroy: function() {
        // if the map panel was passed a map instance, this map instance
        // is under the user's responsibility
        if(!this.initialConfig.map ||
           !(this.initialConfig.map instanceof ol.Map)) {
            // we created the map, we destroy it
            if(this.map) {
                this.map.setTarget(null);
            }
        }
        delete this.map;
        this.callParent(arguments);
    }
});
