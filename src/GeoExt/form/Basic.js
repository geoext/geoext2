/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @include GeoExt/widgets/form/action/Search.js
 */

/**
 * A specific `Ext.form.Basic` whose `doAction` method creates
 * a {@link GeoExt.form.action.Search} if it is passed the string
 * "search" as its first argument.
 *
 * In most cases one would not use this class directly, but
 * `GeoExt.form.Panel` instead.
 */
Ext.define('GeoExt.form.Basic', {
    extend: 'Ext.form.Basic',
    requires: ['GeoExt.form.action.Search'],

    /**
     * @cfg {OpenLayers.Protocol} protocol
     * The protocol to use for search requests.
     */
    /**
     * @property {OpenLayers.Protocol} protocol
     * The protocol.
     */

    /**
     * @property {OpenLayers.Protocol.Response} prevResponse
     * The response return by a call to  protocol.read method.
     * @private
     */

    /**
     * @cfg {Boolean}
     * Tells if pending requests should be aborted when a new action
     * is performed. Default is `true`.
     */
    autoAbort: true,

    /**
     * Performs the action, if the string "search" is passed as the
     * first argument then a {@link GeoExt.form.action.Search} is created.
     * @param {String/Ext.form.action.Action} action Either the name
     * of the action or a `Ext.form.action.Action` instance.
     * @param {Object} options The options passed to the Action
     * constructor.
     * @return {GeoExt.form.Basic} This form.
     *
     */
    doAction: function(action, options) {
        if(action == "search") {
            options = Ext.applyIf(options || {}, {
                form: this,
                protocol: this.protocol,
                abortPrevious: this.autoAbort
            });
            action = new GeoExt.form.action.Search(options);
        }
        return this.callParent([action, options]);
    },

    /**
     * Shortcut to do a search action.
     * @param {Object} options The options passed to the Action
     * constructor.
     * @return {GeoExt.form.Basic} This form.
     *  
     */
    search: function(options) {
        return this.doAction("search", options);
    }
});
