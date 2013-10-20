/*
 * Copyright (c) 2008-2013 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include OpenLayers/Util.js
 * @include GeoExt/panel/Map.js
 */

/**
 * Create a slider to control the zoom of a layer.
 *
 * Sample code to render a slider outside the map viewport:
 *
 * Example:
 *
 *     var slider = Ext.create('GeoExt.slider.Zoom', {
 *         renderTo: document.body,
 *         width: 200,
 *         map: map
 *     });
 *
 *  Sample code to add a slider to a map panel:
 *
 * Example:
 *
 *     var panel = Ext.create('GeoExt.panel.Map', {
 *         renderTo: document.body,
 *         height: 300,
 *         width: 400,
 *         map: {
 *             controls: [new OpenLayers.Control.Navigation()]
 *         },
 *         layers: [new OpenLayers.Layer.WMS(
 *             "Global Imagery",
 *             "http://maps.opengeo.org/geowebcache/service/wms",
 *             {layers: "bluemarble"}
 *         )],
 *         extent: [-5, 35, 15, 55],
 *         items: [{
 *             xtype: "gx_zoomslider",
 *             aggressive: true,
 *             vertical: true,
 *             height: 100,
 *             x: 10,
 *             y: 20
 *         }]
 *     });
 *
 * @class GeoExt.slider.Zoom
 */
Ext.define('GeoExt.slider.Zoom', {
    extend : 'Ext.slider.Single',
    requires : ['GeoExt.panel.Map'],
    alias : 'widget.gx_zoomslider',
    alternateClassName : 'GeoExt.ZoomSlider',

    /**
     * The map that the slider controls.
     *
     * @cfg {OpenLayers.Map/GeoExt.MapPanel} map
     */
    map: null,

    /**
     * The CSS class name for the slider elements.  Default is "gx-zoomslider".
     *
     * @cfg {String} baseCls
     */
    baseCls: "gx-zoomslider",

    /**
     * If set to true, the map is zoomed as soon as the thumb is moved. Otherwise
     * the map is zoomed when the thumb is released (default).
     *
     * @cfg {Boolean} aggressive
     */
    aggressive: false,

    /**
     * The slider position is being updated by itself (based on map zoomend).
     *
     * @property {Boolean} updating
     */
    updating: false,

    /**
     * The map is zoomed by the slider (based on map change/changecomplete).
     *
     * @property {Boolean} zooming
     */
    zooming: false,

    /**
     * The number of millisconds to wait (after rendering the slider) before
     * resizing of the slider happens in case this slider is rendered ad child
     * of a GeoExt.panel.Map.
     *
     * This defaults to 200 milliseconds, which is not really noticeable, and
     * also rather conservative big.
     *
     * @private
     */
    resizingDelayMS: 200,

    /**
     * The height in pixels of the slider thumb. Will be used when we need to
     * manually resize ourself in case we are added to a mappanel. This will
     * be the height of the element containing the thumb when we are rendered
     * horizontally (see #vertical).
     *
     * This value shouldn't usually be adjusted, when the default stylesheet of
     * ExtJS is used.
     *
     * @cfg {Number}
     */
    thumbHeight: 14,

    /**
     * The width in pixels of the slider thumb. Will be used when we need to
     * manually resize ourself in case we are added to a mappanel. This will
     * be the width of the element containing the thumb when we are rendered
     * vertically (see #vertical).
     *
     * This value shouldn't usually be adjusted, when the default stylesheet of
     * ExtJS is used.
     *
     * @cfg {Number}
     */
    thumbWidth: 15,

    /**
     * Initialize the component.
     *
     * @private
     */
    initComponent: function(){
        this.callParent(arguments);

        if(this.map) {
            if(this.map instanceof GeoExt.MapPanel) {
                this.map = this.map.map;
            }
            this.bind(this.map);
        }

        if (this.aggressive === true) {
            this.on('change', this.changeHandler, this);
        } else {
            this.on('changecomplete', this.changeHandler, this);
        }
        this.on("beforedestroy", this.unbind, this);
    },

    /**
     * Override onRender to set base CSS class.
     *
     * @private
     */
    onRender: function() {
        this.callParent(arguments);
        this.el.addCls(this.baseCls);
    },

    /**
     * Override afterRender because the render event is fired too early to call
     * update.
     *
     * @private
     */
    afterRender : function(){
        this.callParent(arguments);
        this.update();
    },

    /**
     * Called by a MapPanel if this component is one of the items in the panel.
     *
     * @param {GeoExt.panel.Map} panel
     * @private
     */
    addToMapPanel: function(panel) {
        this.on({
            /**
             * Once we are rendered and we know that we are a child of a
             * mappanel, we need to make some adjustments to our DOMs
             * box dimensions.
             */
            afterrender: function(){
                var me = this,
                    el = me.getEl(),
                    dim = {
                        // depending on our vertical setting, we need to find
                        // sane values for both width and height.
                        width: me.vertical ? me.thumbWidth : el.getWidth(),
                        height: !me.vertical ? me.thumbHeight : el.getHeight(),
                        top: me.y || 0,
                        left: me.x || 0
                    },
                    resizeFunction,
                    resizeTask;
                // Bind handlers that stop the mouse from interacting with the
                // map below the slider.
                el.on({
                    mousedown: me.stopMouseEvents,
                    click: me.stopMouseEvents
                });
                /**
                 * This method takes some of the gathered values from above and
                 * ensures that we have an expected look.
                 */
                resizeFunction = function(){
                    el.setStyle({
                        top: dim.top,
                        left: dim.left,
                        width: dim.width,
                        position: "absolute",
                        height: dim.height,
                        zIndex: panel.map.Z_INDEX_BASE.Control
                    });
                    // This is tricky...
                    if (me.vertical) {
                        // ...for vertical sliders the height of the surrounding
                        // element is controlled by the height of the element
                        // with the 'x-slider-inner'-class
                        el.down('.x-slider-inner').el.setStyle({
                            height: dim.height - me.thumbWidth
                        });
                    } else {
                        // ...but for horizontal sliders, it's the form element
                        // with class 'x-form-item-body' that controls the
                        // height.
                        el.down('.x-form-item-body').el.setStyle({
                            height: me.thumbHeight
                        });
                    }
                };
                // We delay the execution for a small amount of milliseconds,
                // so that our changes do take effect.
                resizeTask = new Ext.util.DelayedTask(resizeFunction);
                resizeTask.delay(me.resizingDelayMS);
                // bind the map to the slider
                me.bind(panel.map);
            },
            scope: this
        });
    },

    /**
     * @param {Object} e
     * @private
     */
    stopMouseEvents: function(e) {
        e.stopEvent();
    },

    /**
     * Called by a MapPanel if this component is one of the items in the panel.
     *
     * @param {GeoExt.panel.Map} panel
     * @private
     */
    removeFromMapPanel: function(panel) {
        var el = this.getEl();
        el.un("mousedown", this.stopMouseEvents, this);
        el.un("click", this.stopMouseEvents, this);
        this.unbind();
    },

    /**
     * Registers the relevant listeners on the #map to be in sync with it.
     *
     * @param {OpenLayers.Map} map
     * @private
     */
    bind: function(map) {
        this.map = map;
        this.map.events.on({
            zoomend: this.update,
            changebaselayer: this.initZoomValues,
            scope: this
        });
        if(this.map.baseLayer) {
            this.initZoomValues();
            this.update();
        }
    },

    /**
     * Unregisters the bound listeners on the #map, e.g. when being destroyed.
     *
     * @private
     */
    unbind: function() {
        if(this.map && this.map.events) {
            this.map.events.un({
                zoomend: this.update,
                changebaselayer: this.initZoomValues,
                scope: this
            });
        }
    },

    /**
     * Set the min/max values for the slider if not set in the config.
     *
     * @private
     */
    initZoomValues: function() {
        var layer = this.map.baseLayer;
        if(this.initialConfig.minValue === undefined) {
            this.minValue = layer.minZoomLevel || 0;
        }
        if(this.initialConfig.maxValue === undefined) {
            this.maxValue = layer.minZoomLevel == null ?
                layer.numZoomLevels - 1 : layer.maxZoomLevel;
        }
    },

    /**
     * Get the zoom level for the associated map based on the slider value.
     *
     * @return {Number} The map zoom level.
     */
    getZoom: function() {
        return this.getValue();
    },

    /**
     * Get the scale denominator for the associated map based on the slider
     * value.
     *
     * @return {Number} The map scale denominator.
     */
    getScale: function() {
        return OpenLayers.Util.getScaleFromResolution(
            this.map.getResolutionForZoom(this.getValue()),
            this.map.getUnits()
        );
    },

    /**
     * Get the resolution for the associated map based on the slider value.
     *
     * @return {Number} The map resolution.
     */
    getResolution: function() {
        return this.map.getResolutionForZoom(this.getValue());
    },

    /**
     * Registered as a listener for slider changecomplete. Zooms the map.
     *
     * @private
     */
    changeHandler: function() {
        if(this.map && !this.updating) {
            this.zooming = true;
            this.map.zoomTo(this.getValue());
        }
    },

    /**
     * Registered as a listener for map zoomend.Updates the value of the slider.
     *
     * @private
     */
    update: function() {
        if(this.rendered && this.map && !this.zooming) {
            this.updating = true;
            this.setValue(this.map.getZoom());
            this.updating = false;
        }
        this.zooming = false;
    }
});
