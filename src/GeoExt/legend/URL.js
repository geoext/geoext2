Ext.define('GeoExt.legend.URL', {
    extend : 'GeoExt.legend.Layer',
    requires : [
    //    'GeoExt.data.LayerStore'
    ],
    alias : 'widget.gx_urllegend',
    alternateClassName : 'GeoExt.URLLegend',
    
    statics : {
        guess : function() {
            var candidates = Ext.ComponentQuery.query("gx_urllegend");
            return ((candidates && candidates.length > 0) 
                ? candidates[0] 
                : null);
        },
        supports: function(layerRecord) {
            return layerRecord.get("legendURL") != null;
        }
    },
    
          
    /** api: config[defaultStyleIsFirst]
     *  ``Boolean``
     *  The WMS spec does not say if the first style advertised for a layer in
     *  a Capabilities document is the default style that the layer is
     *  rendered with. We make this assumption by default. To be strictly WMS
     *  compliant, set this to false, but make sure to configure a STYLES
     *  param with your WMS layers, otherwise LegendURLs advertised in the
     *  GetCapabilities document cannot be used.
     */
    defaultStyleIsFirst: true,

    /** api: config[useScaleParameter]
     *  ``Boolean``
     *  Should we use the optional SCALE parameter in the SLD WMS
     *  GetLegendGraphic request? Defaults to true.
     */
    useScaleParameter: true,

    /** api: config[baseParams]
     * ``Object``
     *  Optional parameters to add to the legend url, this can e.g. be used to
     *  support vendor-specific parameters in a SLD WMS GetLegendGraphic
     *  request. To override the default MIME type of image/gif use the
     *  FORMAT parameter in baseParams.
     *     
     *  .. code-block:: javascript
     *     
     *      var legendPanel = new GeoExt.LegendPanel({
     *          map: map,
     *          title: 'Legend Panel',
     *          defaults: {
     *              style: 'padding:5px',
     *              baseParams: {
     *                  FORMAT: 'image/png',
     *                  LEGEND_OPTIONS: 'forceLabels:on'
     *              }
     *          }
     *      });   
     */
    baseParams: null,
    
    initComponent: function(){
        var me = this;
        
        me.callParent(arguments);

        this.add(Ext.create('GeoExt.legend.Image', {
            url: this.layerRecord.get("legendURL")
        }));
 
    },

    /** private: method[update]
     *  Update the legend, adding, removing or updating
     *  the per-sublayer box component.
     */
    update: function() {
        this.callParent(arguments);
        this.items.get(1).setUrl(this.layerRecord.get("legendURL"));
    }  
});

// TODO:
GeoExt.legend.Layer.types["gx_urllegend"] = GeoExt.legend.URL;
