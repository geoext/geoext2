/*
 * Copyright (c) 2008-present The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include OpenLayers/Layer/WMS.js
 * @include OpenLayers/Util.js
 * @requires GeoExt/container/LayerLegend.js
 * @requires GeoExt/LegendImage.js
 */

/**
 * Show a legend image for a WMS layer. The image can be read from the styles
 * field of a layer record (if the record comes e.g. from a
 * GeoExt.data.WMSCapabilitiesReader). If not provided, a
 * GetLegendGraphic request will be issued to retrieve the image.
 *
 * @class GeoExt.container.WmsLegend
 */
Ext.define('GeoExt.container.WmsLegend', {
    extend: 'GeoExt.container.LayerLegend',
    alias: 'widget.gx_wmslegend',
    requires: ['GeoExt.LegendImage'],
    alternateClassName: 'GeoExt.WMSLegend',

    statics: {
        /**
         * Checks whether the given layer record supports an URL legend.
         *
         * @param {GeoExt.data.LayerRecord} layerRecord Record containing a
         *     WMS layer.
         * @return {Number} Either `1` when WMS legends are supported or `0`.
         */
        supports: function(layerRecord) {
            return layerRecord.getLayer() instanceof OpenLayers.Layer.WMS ? 1 : 0;
        },

        // TODO This is also been used in data/LayerTreeModel, refactor so this
        //      can be reused or shared
        /**
         * A regular expression to validate whether a given string is a valid id
         * ready to be used either as `id` or `itemId` property. In Ext 5 we can
         * use #Ext.validIdRe, in Ext 4 we define our own regular expression.
         * See #layernameToItemId.
         *
         * @private
         */
        validIdRe: Ext.validIdRe || (/^[a-z_][a-z0-9\-_]*$/i),

        /**
         * A regular expression matching all non allowed characters in possible
         * itemId. See #layernameToItemId.
         *
         * @private
         */
        illegalItemIdRe: (/[^\w\-]+/g),

        /**
         * A string we use as a prefix when we need to construct our own itemIds
         * out of user supplied layer names. See #layernameToItemId
         *
         * @private
         */
        itemIdPrefix: "gx_itemId_",

        /**
         * Turns a given layername into a string suitable for usage as an
         * itemId-property. See {Ext.Component#itemId}:
         *
         * "Valid identifiers start with a letter or underscore and are followed
         * by (optional) additional letters, underscores, digits or hyphens."
         *
         * @param {String} name The layername to convert.
         * @return {String} A string that is now ready to be used as itemId.
         */
        layernameToItemId: function(name){
            var layername = name ? "" + name : "",
                staticMe = GeoExt.container.WmsLegend,
                prefix = staticMe.itemIdPrefix,
                validIdRe = staticMe.validIdRe,
                illegalItemIdRe = staticMe.illegalItemIdRe,
                replace = "-",
                itemId;
            if (validIdRe.test(layername)) {
                itemId = layername;
            } else {
                itemId = prefix + layername.replace(illegalItemIdRe, replace);
            }
            return itemId;
        }
    },

    /**
     * The WMS spec does not say if the first style advertised for a layer in
     * a Capabilities document is the default style that the layer is
     * rendered with. We make this assumption by default. To be strictly WMS
     * compliant, set this to false, but make sure to configure a STYLES
     * param with your WMS layers, otherwise LegendURLs advertised in the
     * GetCapabilities document cannot be used.
     *
     * @cfg {Boolean}
     */
    defaultStyleIsFirst: true,

    /**
     * Should we use the optional SCALE parameter in the SLD WMS
     * GetLegendGraphic request?
     *
     * @cfg {Boolean}
     */
    useScaleParameter: true,

    /**
     * Optional parameters to add to the legend url, this can e.g. be used to
     * support vendor-specific parameters in a SLD WMS GetLegendGraphic
     * request. To override the default MIME type of `image/gif` use the
     * `FORMAT` parameter in baseParams.
     *
     * Example:
     *
     *     var legendPanel = Ext.create('GeoExt.panel.Legend', {
     *         map: map,
     *         title: 'Legend Panel',
     *         defaults: {
     *             style: 'padding:5px',
     *             baseParams: {
     *                 FORMAT: 'image/png',
     *                 LEGEND_OPTIONS: 'forceLabels:on'
     *             }
     *         }
     *     });
     *
     * @cfg {Object}
     */
    baseParams: null,

    /**
     * Fires after wms legend image has loaded.
     *
     * @event legendimageloaded
     */

    /**
     * Initializes this component.
     */
    initComponent: function(){
        var me = this;
        me.callParent();
        var layer = me.layerRecord.getLayer();
        me._noMap = !layer.map;
        layer.events.register("moveend", me, me.onLayerMoveend);
        me.update();
    },

    /**
     * Called when `moveend` fires on the associated layer. Might call #update
     * to be in sync with layer style.
     *
     * @private
     * @param {Object} e
     */
    onLayerMoveend: function(e) {
        if ((e.zoomChanged === true && this.useScaleParameter === true) ||
            this._noMap) {
            delete this._noMap;
            this.update();
        }
    },

    /**
     * Get the legend URL of a sublayer.
     *
     * @param {String} layerName A sublayer.
     * @param {Array} layerNames The array of sublayers, read from #layerRecord
     *     if not provided.
     * @return {String} The legend URL.
     * @private
     */
    getLegendUrl: function(layerName, layerNames) {
        var rec = this.layerRecord;
        var url;
        var styles = rec && rec.get("styles");
        var layer = rec.getLayer();
        layerNames = layerNames || [layer.params.LAYERS].join(",").split(",");

        var styleNames = layer.params.STYLES &&
        [layer.params.STYLES].join(",").split(",");
        var idx = Ext.Array.indexOf(layerNames, layerName);
        var styleName = styleNames && styleNames[idx];
        var params = {};
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
            params = Ext.apply({}, this.baseParams);
        }
        if(!url) {
            var paramObject = Ext.apply({
                REQUEST: "GetLegendGraphic",
                WIDTH: null,
                HEIGHT: null,
                EXCEPTIONS: "application/vnd.ogc.se_xml",
                LAYER: layerName,
                LAYERS: null,
                STYLE: (styleName !== '') ? styleName: null,
                STYLES: null,
                SRS: null,
                FORMAT: null,
                TIME: null
            }, this.baseParams);
            
            url = layer.getFullRequestString(paramObject);
            params = {};
        }
        if (layer.params._OLSALT) {
            // update legend after a forced layer redraw
            params._OLSALT = layer.params._OLSALT;
        }
        url = Ext.urlAppend(url, Ext.urlEncode(params));
        if (url.toLowerCase().indexOf("request=getlegendgraphic") != -1) {
            if (url.toLowerCase().indexOf("format=") == -1) {
                url = Ext.urlAppend(url, "FORMAT=image%2Fgif");
            }
            // add scale parameter - also if we have the url from the record's
            // styles data field and it is actually a GetLegendGraphic request.
            if (this.useScaleParameter === true) {
                var scale = layer.map.getScale();
                url = Ext.urlAppend(url, "SCALE=" + scale);
            }
        }
        return url;
    },

    /**
     * Update the legend, adding, removing or updating
     * the per-sublayer box component.
     *
     * @private
     */
    update: function() {
        var layer = this.layerRecord.getLayer();
        // In some cases, this update function is called on a layer
        // that has just been removed, see ticket #238.
        // The following check bypass the update if map is not set.
        if(!(layer && layer.map)) {
            return;
        }
        this.callParent();

        var layerNames,
            layerName,
            i,
            len,
            itemIdCandidate,
            itemIdCandidates = [];

        layerNames = [layer.params.LAYERS].join(",").split(",");

        Ext.each(layerNames, function(name){
            itemIdCandidates.push(this.self.layernameToItemId(name));
        }, this);

        var destroyList = [];
        var textCmp = this.items.get(0);
        this.items.each(function(cmp) {
            i = Ext.Array.indexOf(itemIdCandidates, cmp.itemId);
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
            itemIdCandidate = this.self.layernameToItemId(layerName);
            if(!this.items || !this.getComponent(itemIdCandidate)) {
                this.add({
                    xtype: "gx_legendimage",
                    url: this.getLegendUrl(layerName, layerNames),
                    itemId: itemIdCandidate,
                    listeners: {
                        'legendimageloaded': function() {
                            this.fireEvent('legendimageloaded', this);
                        },
                        scope: this
                    }
                });
            }
        }
        this.doLayout();
    },

    /**
     * Unregisters the moveend-listener prior to destroying.
     */
    beforeDestroy: function() {
        if (this.useScaleParameter === true) {
            var layer = this.layerRecord.getLayer();
            layer && layer.events &&
            layer.events.unregister("moveend", this, this.onLayerMoveend);
        }
        this.callParent();
    }
}, function() {
    GeoExt.container.LayerLegend.types["gx_wmslegend"] =
        GeoExt.container.WmsLegend;
});
