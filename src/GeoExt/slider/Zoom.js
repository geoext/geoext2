/**
 * @class GeoExt.slider.Zoom
 * 
 * Sample code to render a slider outside the map viewport:
 * 
 *      @example
 *      var slider = Ext.create('GeoExt.slider.Zoom', {
 *          renderTo: document.body,
 *          width: 200,
 *          map: map
 *      });
 *      
 *  Sample code to add a slider to a map panel:
 *  
 *      @example
 *      var panel = Ext.create('GeoExt.MapPanel', {
 *          renderTo: document.body,
 *          height: 300,
 *          width: 400,
 *          map: {
 *              controls: [new OpenLayers.Control.Navigation()]
 *          },
 *          layers: [new OpenLayers.Layer.WMS(
 *              "Global Imagery",
 *              "http://maps.opengeo.org/geowebcache/service/wms",
 *              {layers: "bluemarble"}
 *          )],
 *          extent: [-5, 35, 15, 55],
 *          items: [{
 *              xtype: "gx_zoomslider",
 *              aggressive: true,
 *              vertical: true,
 *              height: 100,
 *              x: 10,
 *              y: 20
 *          }]
 *      });
 * 
 */
Ext.define('GeoExt.slider.Zoom', {
    extend : 'Ext.slider.Single',
    requires : ['GeoExt.panel.Map'],
    alias : 'widget.gx_zoomslider',
    alternateClassName : 'GeoExt.ZoomSlider',
    
    /**
     * @cfg {OpenLayers.Map/GeoExt.MapPanel} map
     * The map that the slider controls.
     */
    map: null,
    
    /**
     * @cfg {String} baseCls
     * The CSS class name for the slider elements.  Default is "gx-zoomslider".
     */
    baseCls: "gx-zoomslider",

    /**
     * @cfg {Boolean} aggressive
     * If set to true, the map is zoomed as soon as the thumb is moved. Otherwise 
     *  the map is zoomed when the thumb is released (default).
     */
    aggressive: false,
    
    /**
     * @property {Boolean} updating
     * The slider position is being updated by itself (based on map zoomend).
     */
    updating: false,
    
    /**
     * @private
     * Initialize the component.
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
     * @private
     * Override onRender to set base css class.
     */
    onRender: function() {
        this.callParent(arguments);
        this.el.addCls(this.baseCls);
    },
    
    /**
     * @private
     * Override afterRender because the render event is fired too early
     *  to call update.
     */
    afterRender : function(){
        this.callParent(arguments);
        this.update();
    },
    
    /**
     * @private
     * @param {GeoExt.panel.Map} panel
     * 
     * Called by a MapPanel if this component is one of the items in the panel.
     */
    addToMapPanel: function(panel) {
        this.on({
            render: function() {
                var el = this.getEl();
                el.setStyle({
                    position: "absolute",
                    zIndex: panel.map.Z_INDEX_BASE.Control
                });
                el.on({
                    mousedown: this.stopMouseEvents,
                    click: this.stopMouseEvents
                });
            },
            afterrender: function() {
                this.bind(panel.map);
            },
            scope: this
        });
    },
    
    /**
     * @private
     * @param {Object} e
     */
    stopMouseEvents: function(e) {
        e.stopEvent();
    },
    
    /**
     * @private
     * @param {GeoExt.panel.Map}
     * 
     * Called by a MapPanel if this component is one of the items in the panel.
     * 
     */
    removeFromMapPanel: function(panel) {
        var el = this.getEl();
        el.un("mousedown", this.stopMouseEvents, this);
        el.un("click", this.stopMouseEvents, this);
        this.unbind();
    },
    
    /**
     * @private
     * @param {OpenLayers.Map}
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
     * @private
     * Set the min/max values for the slider if not set in the config.
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
     * @return {Number} The map zoom level.
     * 
     * Get the zoom level for the associated map based on the slider value.
     */
    getZoom: function() {
        return this.getValue();
    },
    
    /**
     * @return {Number} The map scale denominator.
     * 
     * Get the scale denominator for the associated map based on the slider value.
     */
    getScale: function() {
        return OpenLayers.Util.getScaleFromResolution(
            this.map.getResolutionForZoom(this.getValue()),
            this.map.getUnits()
        );
    },
    
    /**
     * @return {Number} The map resolution.
     * 
     * Get the resolution for the associated map based on the slider value.
     */
    getResolution: function() {
        return this.map.getResolutionForZoom(this.getValue());
    },
    
    /**
     * @private
     * Registered as a listener for slider changecomplete. Zooms the map.
     */
    changeHandler: function() {
        if(this.map && !this.updating) {
            this.map.zoomTo(this.getValue());
        }
    },
    
    /**
     * @private
     * Registered as a listener for map zoomend. 
     * Updates the value of the slider.
     */
    update: function() {
        if(this.rendered && this.map) {
            this.updating = true;
            this.setValue(this.map.getZoom());
            this.updating = false;
        }
    }
});