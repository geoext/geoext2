Ext.define('GeoExt.legend.WMSLayer', {
    extend : 'GeoExt.legend.Layer',
    requires : [
    //    'GeoExt.data.LayerStore'
    ],
    alias : 'widget.gx_wmslegend',
    alternateClassName : 'GeoExt.WMSLegend',
    
    statics : {
        guess : function() {
            var candidates = Ext.ComponentQuery.query("gx_wmslegend");
            return ((candidates && candidates.length > 0) 
                ? candidates[0] 
                : null);
        },
        supports: function(layerRecord) {
            return layerRecord.getLayer() instanceof OpenLayers.Layer.WMS;
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

        var layer = me.layerRecord.getLayer();
        me._noMap = !layer.map;
        layer.events.register("moveend", me, me.onLayerMoveend);
        me.update();
 
    },
    
    /** private: method[onLayerMoveend]
     *  :param e: ``Object``
     */
    onLayerMoveend: function(e) {
        if ((e.zoomChanged === true && this.useScaleParameter === true) ||
            this._noMap) {
            delete this._noMap;
            this.update();
        }
    },

    /** private: method[getLegendUrl]
     *  :param layerName: ``String`` A sublayer.
     *  :param layerNames: ``Array(String)`` The array of sublayers,
     *      read from this.layerRecord if not provided.
     *  :return: ``String`` The legend URL.
     *
     *  Get the legend URL of a sublayer.
     */
    getLegendUrl: function(layerName, layerNames) {
        var rec = this.layerRecord;
        var url;
        var styles = rec && rec.get("styles");
        var layer = rec.getLayer();
        layerNames = layerNames || [layer.params.LAYERS].join(",").split(",");

        var styleNames = layer.params.STYLES &&
        [layer.params.STYLES].join(",").split(",");
        var idx = layerNames.indexOf(layerName);
        var styleName = styleNames && styleNames[idx];
        // check if we have a legend URL in the record's
        // "styles" data field
        if(styles && styles.length > 0) {
            if(styleName) {
                Ext.each(styles, function(s) {
                    url = (s.name == styleName && s.legend) && s.legend.href;
                    return !url;
                });
            } else if(this.defaultStyleIsFirst === true && !styleNames &&
                !layer.params.SLD && !layer.params.SLD_BODY) {
                url = styles[0].legend && styles[0].legend.href;
            }
        }
        if(!url) {
            url = layer.getFullRequestString({
                REQUEST: "GetLegendGraphic",
                WIDTH: null,
                HEIGHT: null,
                EXCEPTIONS: "application/vnd.ogc.se_xml",
                LAYER: layerName,
                LAYERS: null,
                STYLE: (styleName !== '') ? styleName: null,
                STYLES: null,
                SRS: null,
                FORMAT: null
            });
        }
        if (url.toLowerCase().indexOf("request=getlegendgraphic") != -1) {
            if (url.toLowerCase().indexOf("format=") == -1) {
                url = Ext.urlAppend(url, "FORMAT=image/gif");
            }
            // add scale parameter - also if we have the url from the record's
            // styles data field and it is actually a GetLegendGraphic request.
            if (this.useScaleParameter === true) {
                var scale = layer.map.getScale();
                url = Ext.urlAppend(url, "SCALE=" + scale);
            }
        }
        var params = Ext.apply({}, this.baseParams);
        if (layer.params._OLSALT) {
            // update legend after a forced layer redraw
            params._OLSALT = layer.params._OLSALT;
        }
        url = Ext.urlAppend(url, Ext.urlEncode(params));
        
        return url;
    },

    /** private: method[update]
     *  Update the legend, adding, removing or updating
     *  the per-sublayer box component.
     */
    update: function() {
        var layer = this.layerRecord.getLayer();
        // In some cases, this update function is called on a layer
        // that has just been removed, see ticket #238.
        // The following check bypass the update if map is not set.
        if(!(layer && layer.map)) {
            return;
        }
        this.callParent(arguments);
        
        var layerNames, layerName, i, len;

        layerNames = [layer.params.LAYERS].join(",").split(",");

        var destroyList = [];
        var textCmp = this.items.get(0);
        this.items.each(function(cmp) {
            i = layerNames.indexOf(cmp.itemId);
            if(i < 0 && cmp != textCmp) {
                destroyList.push(cmp);
            } else if(cmp !== textCmp){
                layerName = layerNames[i];
                var newUrl = this.getLegendUrl(layerName, layerNames);
                if(!OpenLayers.Util.isEquivalentUrl(newUrl, cmp.url)) {
                    cmp.setUrl(newUrl);
                }
            }
        }, this);
        for(i = 0, len = destroyList.length; i<len; i++) {
            var cmp = destroyList[i];
            // cmp.destroy() does not remove the cmp from
            // its parent container!
            this.remove(cmp);
            cmp.destroy();
        }

        for(i = 0, len = layerNames.length; i<len; i++) {
            layerName = layerNames[i];
            if(!this.items || !this.getComponent(layerName)) {
                this.add({
                    xtype: "gx_legendimage",
                    url: this.getLegendUrl(layerName, layerNames),
                    itemId: layerName
                });
            }
        }
        this.doLayout();
    },

    /** private: method[beforeDestroy]
     */
    beforeDestroy: function() {
        if (this.useScaleParameter === true) {
            var layer = this.layerRecord.getLayer();
            layer && layer.events &&
            layer.events.unregister("moveend", this, this.onLayerMoveend);
        }
        this.callParent(arguments);
    }
});

// TODO:
GeoExt.legend.Layer.types["gx_wmslegend"] = GeoExt.legend.WMSLayer;
