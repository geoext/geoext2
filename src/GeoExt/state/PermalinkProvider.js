/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include OpenLayers/Util.js
 */

/**
 * @class GeoExt.state.PermalinkProvider
 *
 * The permalink provider.
 *
 *  Sample code displaying a new permalink each time the map is moved.
 *
 * Example:
<pre><code>
// create permalink provider
var permalinkProvider = new GeoExt.state.PermalinkProvider();

// set it in the state manager
Ext.state.Manager.setProvider(permalinkProvider);

// create a map panel, and make it stateful
var mapPanel = new GeoExt.MapPanel({
    renderTo: "map",
    layers: [
        new OpenLayers.Layer.WMS(
            "Global Imagery",
            "http://maps.opengeo.org/geowebcache/service/wms",
            {layers: "bluemarble"}
        )
    ],
    stateId: "map",
    prettyStateKeys: true // for pretty permalinks
});

// display permalink each time state is changed
permalinkProvider.on({
    statechanged: function(provider, name, value) {
        alert(provider.getLink());
    }
});
</code></pre>
 */
Ext.define('GeoExt.state.PermalinkProvider', {
    extend : 'Ext.state.Provider',
    requires : [
    //    'GeoExt.data.LayerStore'
    ],
    alias : 'widget.gx_permalinkprovider',
    //    alternateClassName : 'GeoExt.MapPanel',
    constructor: function(config){
        this.callParent(arguments);
        config = config || {};

        var url = config.url;
        delete config.url;

        Ext.apply(this, config);

        this.state = this.readURL(url);

    },

    /**
     * @private
     * @property{Boolean}
     *  Specifies whether type of state values should be encoded
     *  and decoded. Set it to false if you work with components that don't
     *  require encoding types, and want pretty permalinks. Defaults to true.
     */
    encodeType: true,

    initComponent: function(){
        var me = this;

        me.callParent(arguments);
    },

    /**
     * Create a state object from a URL.
     *
     * @private
     * @param url {String} The URL to get the state from.
     * @return {Object} The state object.
     */
    readURL: function(url) {
        var state = {};
        var params = OpenLayers.Util.getParameters(url);
        var k, split, stateId;
        for(k in params) {
            if(params.hasOwnProperty(k)) {
                split = k.split("_");
                if(split.length > 1) {
                    stateId = split[0];
                    state[stateId] = state[stateId] || {};
                    state[stateId][split.slice(1).join("_")] = this.encodeType ?
                    this.decodeValue(params[k]) : params[k];
                }
            }
        }
        return state;
    },

    /**
     * Returns the permalink corresponding to the current state.
     *
     * @param base {String} The base URL, optional.
     * @return {String} The permalink.
     */
    getLink: function(base) {
        base = base || document.location.href;

        var params = {};

        var id, k, state = this.state;
        for(id in state) {
            if(state.hasOwnProperty(id)) {
                for(k in state[id]) {
                    params[id + "_" + k] = this.encodeType ?
                    unescape(this.encodeValue(state[id][k])) : state[id][k];
                }
            }
        }

        // merge params in the URL into the state params
        OpenLayers.Util.applyDefaults(
            params, OpenLayers.Util.getParameters(base));

        var paramsStr = OpenLayers.Util.getParameterString(params);

        var qMark = base.indexOf("?");
        if(qMark > 0) {
            base = base.substring(0, qMark);
        }

        return Ext.urlAppend(base, paramsStr);
    }


});






