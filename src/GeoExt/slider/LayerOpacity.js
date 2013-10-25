/*
 * Copyright (c) 2008-2013 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include OpenLayers/Layer.js
 * @include GeoExt/data/LayerModel.js
 */

/**
 * Create a slider to control the opacity of a layer.
 *
 * Sample code to render a slider outside the map viewport:
 *
 *     var slider = Ext.create('GeoExt.slider.LayerOpacity', {
 *         renderTo: Ext.getBody(),
 *         width: 200,
 *         layer: layer
 *     });
 *
 * Sample code to add a slider to a map panel:
 *
 *     var layer = new OpenLayers.Layer.WMS(
 *         "Global Imagery",
 *         "http://maps.opengeo.org/geowebcache/service/wms",
 *          {layers: "bluemarble"}
 *     );
 *     var panel = Ext.create('GeoExt.panel.Map', {
 *         renderTo: document.body,
 *         height: 300,
 *         width: 400,
 *         map: {
 *             controls: [new OpenLayers.Control.Navigation()]
 *         },
 *         layers: [layer],
 *         extent: [-5, 35, 15, 55],
 *         items: [{
 *             xtype: "gx_opacityslider",
 *             layer: layer,
 *             aggressive: true,
 *             vertical: true,
 *             height: 100,
 *             x: 10,
 *             y: 20
 *         }]
 *     });
 *
 * @class GeoExt.slider.LayerOpacity
 */
Ext.define('GeoExt.slider.LayerOpacity', {
    alternateClassName: "GeoExt.LayerOpacitySlider",
    extend: 'Ext.slider.Single',
    requires: 'GeoExt.data.LayerModel',
    alias: 'widget.gx_opacityslider',

    /**
     * The layer this slider changes the opacity of. (required)
     *
     * @cfg {OpenLayers.Layer/GeoExt.data.LayerModel}
     */
    layer: null,

    /**
     * If provided, a layer that will be made invisible (its visibility is
     * set to false) when the slider value is set to its max value. If this
     * slider is used to fade visibility between to layers, setting
     * `complementaryLayer` and `changeVisibility` will make sure that
     * only visible tiles are loaded when the slider is set to its min or max
     * value. (optional)
     *
     * @cfg {OpenLayers.Layer/GeoExt.data.LayerModel}
     */
    complementaryLayer: null,

    /**
     * Time in milliseconds before setting the opacity value to the
     * layer. If the value change again within that time, the original value
     * is not set. Only applicable if aggressive is true.
     *
     * @cfg {Number}
     */
    delay: 5,

    /**
     * Time in milliseconds before changing the layer's visibility.
     * If the value changes again within that time, the layer's visibility
     * change does not occur. Only applicable if changeVisibility is true.
     * Defaults to 5.
     *
     * @cfg {Number}
     */
    changeVisibilityDelay: 5,

    /**
     * If set to true, the opacity is changed as soon as the thumb is moved.
     * Otherwise when the thumb is released (default).
     *
     * @cfg {Boolean}
     */
    aggressive: false,

    /**
     * If set to true, the layer's visibility is handled by the
     * slider, the slider makes the layer invisible when its
     * value is changed to the min value, and makes the layer
     * visible again when its value goes from the min value
     * to some other value. The layer passed to the constructor
     * must be visible, as its visibility is fully handled by
     * the slider. Defaults to false.
     *
     * @cfg {Boolean}
     */
    changeVisibility: false,

    /**
     * The value to initialize the slider with. This value is
     * taken into account only if the layer's opacity is null.
     * If the layer's opacity is null and this value is not
     * defined in the config object then the slider initializes
     * it to the max value.
     *
     * @cfg {Number}
     */
    value: null,

    /**
     * If true, we will work with transparency instead of with opacity.
     * Defaults to false.
     *
     * @cfg {Boolean}
     */
    inverse: false,

    /**
     * The number of milliseconds to wait (after rendering the slider) before
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
     * Construct the component.
     *
     * @private
     */
    constructor: function(config) {
        if (config.layer) {
            this.layer = this.getLayer(config.layer);
            this.bind();
            this.complementaryLayer = this.getLayer(config.complementaryLayer);
            // before we call getOpacityValue inverse should be set
            if (config.inverse !== undefined) {
                this.inverse = config.inverse;
            }
            config.value = (config.value !== undefined) ?
                config.value : this.getOpacityValue(this.layer);
            delete config.layer;
            delete config.complementaryLayer;
        }
        this.callParent([config]);
    },

    /**
     * Bind the slider to the layer.
     *
     * @private
     */
    bind: function() {
        if (this.layer && this.layer.map) {
            this.layer.map.events.on({
                changelayer: this.update,
                scope: this
            });
        }
    },

    /**
     * Unbind the slider from the layer.
     *
     * @private
     */
    unbind: function() {
        if (this.layer && this.layer.map && this.layer.map.events) {
            this.layer.map.events.un({
                changelayer: this.update,
                scope: this
            });
        }
    },

    /**
     * Registered as a listener for opacity change.  Updates the value of the
     * slider.
     *
     * @private
     */
    update: function(evt) {
        if (evt.property === "opacity" && evt.layer == this.layer &&
            !this._settingOpacity) {
            this.setValue(this.getOpacityValue(this.layer));
        }
    },

    /**
     * Bind a new layer to the opacity slider.
     *
     * @param {OpenLayers.Layer/GeoExt.data.LayerModel} layer
     */
    setLayer: function(layer) {
        this.unbind();
        this.layer = this.getLayer(layer);
        this.setValue(this.getOpacityValue(layer));
        this.bind();
    },

    /**
     * Returns the opacity value for the layer.
     *
     * @param {OpenLayers.Layer/GeoExt.data.LayerModel} layer
     * @return {Integer} The opacity for the layer.
     * @private
     */
    getOpacityValue: function(layer) {
        var value;
        if (layer && layer.opacity !== null) {
            value = parseInt(layer.opacity * (this.maxValue - this.minValue));
        } else {
            value = this.maxValue;
        }
        if (this.inverse === true) {
            value = (this.maxValue - this.minValue) - value;
        }
        return value;
    },

    /**
     * Returns the OpenLayers layer object for a layer record or a plain layer
     * object.
     *
     * @param {OpenLayers.Layer/GeoExt.data.LayerModel} layer
     * @return {OpenLayers.Layer} The OpenLayers layer object
     * @private
     */
    getLayer: function(layer) {
        if (layer instanceof OpenLayers.Layer) {
            return layer;
        } else if (layer instanceof GeoExt.data.LayerModel) {
            return layer.getLayer();
        }
    },

    /**
     * Initialize the component.
     *
     * @private
     */
    initComponent: function() {

        this.callParent();

        if (this.changeVisibility && this.layer &&
            (this.layer.opacity == 0 ||
            (this.inverse === false && this.value == this.minValue) ||
            (this.inverse === true && this.value == this.maxValue))) {
            this.layer.setVisibility(false);
        }

        if (this.complementaryLayer &&
            ((this.layer && this.layer.opacity == 1) ||
             (this.inverse === false && this.value == this.maxValue) ||
             (this.inverse === true && this.value == this.minValue))) {
            this.complementaryLayer.setVisibility(false);
        }

        if (this.aggressive === true) {
            this.on('change', this.changeLayerOpacity, this, {
                buffer: this.delay
            });
        } else {
            this.on('changecomplete', this.changeLayerOpacity, this);
        }

        if (this.changeVisibility === true) {
            this.on('change', this.changeLayerVisibility, this, {
                buffer: this.changeVisibilityDelay
            });
        }

        if (this.complementaryLayer) {
            this.on('change', this.changeComplementaryLayerVisibility, this, {
                buffer: this.changeVisibilityDelay
            });
        }
        this.on("beforedestroy", this.unbind, this);
    },

    /**
     * Updates the `OpenLayers.Layer` opacity value.
     *
     * @param {GeoExt.LayerOpacitySlider} slider
     * @param {Number} value The slider value
     * @private
     */
    changeLayerOpacity: function(slider, value) {
        if (this.layer) {
            value = value / (this.maxValue - this.minValue);
            if (this.inverse === true) {
                value = 1 - value;
            }
            this._settingOpacity = true;
            this.layer.setOpacity(value);
            delete this._settingOpacity;
        }
    },

    /**
     * Updates the `OpenLayers.Layer` visibility.
     *
     * @param {GeoExt.LayerOpacitySlider} slider
     * @param {Number} value The slider value
     * @private
     */
    changeLayerVisibility: function(slider, value) {
        var currentVisibility = this.layer.getVisibility();
        if ((this.inverse === false && value == this.minValue) ||
            (this.inverse === true && value == this.maxValue) &&
            currentVisibility === true) {
            this.layer.setVisibility(false);
        } else if ((this.inverse === false && value > this.minValue) ||
            (this.inverse === true && value < this.maxValue) &&
                   currentVisibility == false) {
            this.layer.setVisibility(true);
        }
    },

    /**
     * Updates the complementary `OpenLayers.Layer` visibility.
     *
     * @param {GeoExt.LayerOpacitySlider} slider
     * @param {Number} value The slider value
     * @private
     */
    changeComplementaryLayerVisibility: function(slider, value) {
        var currentVisibility = this.complementaryLayer.getVisibility();
        if ((this.inverse === false && value == this.maxValue) ||
            (this.inverse === true && value == this.minValue) &&
            currentVisibility === true) {
            this.complementaryLayer.setVisibility(false);
        } else if ((this.inverse === false && value < this.maxValue) ||
            (this.inverse === true && value > this.minValue) &&
                   currentVisibility == false) {
            this.complementaryLayer.setVisibility(true);
        }
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
            },
            scope: this
        });
    },

    /**
     * Called by a MapPanel if this component is one of the items in the panel.
     *
     * @param {GeoExt.panel.Map} panel
     * @private
     */
    removeFromMapPanel: function(panel) {
        var el = this.getEl();
        el.un({
            mousedown: this.stopMouseEvents,
            click: this.stopMouseEvents,
            scope: this
        });
        this.unbind();
    },

    /**
     * Stops the event from propagating.
     *
     * @private
     */
    stopMouseEvents: function(e) {
        e.stopEvent();
    }

});
