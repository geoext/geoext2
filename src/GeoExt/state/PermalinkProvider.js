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
    /** api: config[encodeType]
   *  ``Boolean`` Specifies whether type of state values should be encoded
   *  and decoded. Set it to false if you work with components that don't
   *  require encoding types, and want pretty permalinks. Defaults to true.
   */
    /** private: property[encodeType]
   *  ``Boolean``
   */
    encodeType: true,
    
    initComponent: function(){
        var me = this;
            
        me.callParent(arguments);
    },
        
    /** private: method[readURL]
     *  :param url: ``String`` The URL to get the state from.
     *  :return: ``Object`` The state object.
     *
     *  Create a state object from a URL.
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

    /** api: method[getLink]
     *  :param base: ``String`` The base URL, optional.
     *  :return: ``String`` The permalink.
     *
     *  Return the permalink corresponding to the current state.
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






