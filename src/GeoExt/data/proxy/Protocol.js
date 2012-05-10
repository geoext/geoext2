/**
 * @class GeoExt.data.proxy.Protocol
 * A data proxy for use with {OpenLayers.Protocol} objects.
 */
Ext.define('GeoExt.data.proxy.Protocol', {
    extend: 'Ext.data.proxy.Server',

    /** 
     * @cfg {OpenLayers.Protocol}
     * The protocol used to fetch features.
     */
    protocol: null,

    /** 
     * @cfg {Boolean}
     * Abort any previous request before issuing another. Default is ``true``.
     */
    abortPrevious: true,

    /** 
     * @cfg {Boolean}
     * Should options.params be set directly on options before passing it into
     * the protocol's read method? Default is ``false``.
     */
    setParamsAsOptions: false,

    /** 
     * @property {OpenLayers.Protocol.Response}
     * @private
     * The response returned by the read call on the protocol.
     */
    response: null,

    /**
     * @param {Ext.data.Operation} operation The Ext.data.Operation object
     * @param {Function} callback The callback function to call when the Operation has completed
     * @param {Object} scope The scope in which to execute the callback
     */
    doRequest: function(operation, callback, scope) {
        var params = operation ? operation.params : {};
        var o = {
            params: params || {},
            request: {
                callback: callback,
                scope: scope
            },
            reader: this.getReader()
        };
        var cb = OpenLayers.Function.bind(this.loadResponse, this, o);
        if (this.abortPrevious) {
            this.abortRequest();
        }
        var options = {
            params: params,
            callback: cb,
            scope: this
        };
        if (this.setParamsAsOptions === true) {
            Ext.applyIf(options, options.params);
            delete options.params;
        }
        this.response = this.protocol.read(options);
    },

    /** private: method[abortRequest]
     *  Called to abort any ongoing request.
     */
    abortRequest: function() {
        if (this.response) {
            this.protocol.abort(this.response);
            this.response = null;
        }
    },

    /** private: method[loadResponse]
     *  :param o: ``Object``
     *  :param response: ``OpenLayers.Protocol.Response``
     *  
     *  Handle response from the protocol
     */
    loadResponse: function(o, response) {
        if (response.success()) {
            var result = o.reader.read(response);
            o.request.callback.call(
               o.request.scope, result, true);
        } else {
            this.fireEvent('exception', this, response);
            o.request.callback.call(
                o.request.scope, null, false);
        }
    }
});
