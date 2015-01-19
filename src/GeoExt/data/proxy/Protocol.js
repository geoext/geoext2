/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @requires GeoExt/Version.js
 */

/**
 * A data proxy for use with OpenLayers.Protocol objects.
 *
 * @class GeoExt.data.proxy.Protocol
 */
Ext.define('GeoExt.data.proxy.Protocol', {
    extend: 'Ext.data.proxy.Server',
    requires: [
        'GeoExt.Version'
    ],
    alias: 'proxy.gx_protocol',

    config:  {

        /**
         * The protocol used to fetch features.
         *
         * @cfg {OpenLayers.Protocol}
         */
        protocol: null,

        /**
         * Abort any previous request before issuing another.
         *
         * @cfg {Boolean}
         */
        abortPrevious: true,

        /**
         * Should options.params be set directly on options before passing it
         * into the protocol's read method?
         *
         * @cfg {Boolean}
         */
        setParamsAsOptions: false,

        /**
         * The reader to use.
         *
         * @cfg {Ext.data.reader.Reader}
         */
        reader: {}

    },

    /**
     * We need to override this as the OpenLayers classes passed as configs
     * loose their class-nature and seem to be copied by ExtJS somewhere.
     *
     * We deal with this elsewhere in a different manner and should see if
     * we can either share code or get rid of this special handling all
     * together. The problem isn't reproducible for other 'classes' with a
     * similar inheritance strategy as OpenLayers 2 has.
     *
     * TODO Find a way to have this functionality shared or get rid of it.
     *
     * @param {Object} config the configuration as passed by the user.
     */
    initConfig: function(config){
        var me = this,
            cfg = config || {},
            prefix = me.$configPrefixed ? '_' : '',
            olConfigs = [
                'protocol'
            ];
        Ext.each(olConfigs, function(olConfig){
            if (cfg[olConfig]) {
                me[prefix + olConfig] = cfg[olConfig];
                delete cfg[olConfig];
            }
        });
        me.callParent([cfg]);
    },

    model: 'Ext.data.Model',

    /**
     * The response returned by the read call on the protocol.
     *
     * @property {OpenLayers.Protocol.Response}
     * @private
     */
    response: null,

    /**
     * Send the request.
     *
     * @param {Ext.data.Operation} operation The Ext.data.Operation object.
     * @param {Function} callback The callback function to call when the
     *     operation has completed.
     * @param {Object} scope The scope in which to execute the callback.
     * @private
     */
    doRequest: function(operation, callback, scope) {
        var me = this,
            operationParams,
            params,
            request,
            o,
            cb,
            options;

        if(GeoExt.isExt5){
            callback = callback || operation.getCallback();
            scope = scope || operation.getScope();
            operationParams = operation.getParams() || {};
        } else {
            operationParams = operation.params || {};
        }

        params = Ext.applyIf(operationParams, me.extraParams || {});

        //copy any sorters, filters etc into the params so they can be sent over
        //the wire
        params = Ext.applyIf(params, me.getParams(operation));

        o = {
            params: params || {},
            operation: operation,
            request: {
                callback: callback,
                scope: scope,
                arg: operation.arg || operation.config.arg
            },
            reader: me.getReader()
        };
        cb = OpenLayers.Function.bind(me.loadResponse, me, o);
        if (me.getAbortPrevious()) {
            me.abortRequest();
        }
        options = {
            params: params,
            callback: cb,
            scope: me
        };
        Ext.applyIf(options, operation.arg || operation.config.arg);
        if (me.getSetParamsAsOptions() === true) {
            Ext.applyIf(options, options.params);
            delete options.params;
        }

        me.response = me.getProtocol().read(options);
    },

    /**
     * Called to abort any ongoing request.
     *
     * @private
     */
    abortRequest: function() {
        var me = this;
        if (me.response) {
            me.getProtocol().abort(me.response);
            me.response = null;
        }
    },

    /**
     * Handle response from the protocol.
     *
     * @param {Object} o
     * @param {OpenLayers.Protocol.Response} response
     * @private
     */
    loadResponse: function(o, response) {
        var me = this,
            operation = o.operation,
            scope = o.request.scope,
            callback = o.request.callback,
            result;
        if (response.success()) {
            result = o.reader.read(response.features || response);
            Ext.apply(operation, {
                response: response,
                resultSet: result
            });

            if (GeoExt.isExt4) {
                operation.commitRecords(result.records);
            } else {
                operation.setRecords(result.records);
            }
            operation.setCompleted();
            operation.setSuccessful();
        } else {
            me.setException(operation, response);
            me.fireEvent('exception', this, response, operation);
        }
        if (typeof callback == 'function') {
            callback.call(scope || me, operation);
        }
    }
});
