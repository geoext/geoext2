/**
 * Copyright (c) 2008-2011 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/** api: (define)
 *  module = GeoExt.form
 *  class = SearchAction
 *  base_link = `Ext.form.Action <http://dev.sencha.com/deploy/dev/docs/?class=Ext.form.Action>`_
 */

/**
 * @include GeoExt/widgets/form.js
 */

/** api: example
 *  Sample code showing how to use a GeoExt SearchAction with an Ext form panel:
 *  
 *  .. code-block:: javascript
 *
 *      var formPanel = new Ext.form.Panel({
 *          renderTo: "formpanel",
 *          items: [{
 *              xtype: "textfield",
 *              name: "name__like",
 *              value: "mont"
 *          }, {
 *              xtype: "textfield",
 *              name: "elevation__ge",
 *              value: "2000"
 *          }]
 *      });
 *
 *      var searchAction = new GeoExt.form.SearchAction(formPanel.getForm(), {
 *          protocol: new OpenLayers.Protocol.WFS({
 *              url: "http://publicus.opengeo.org/geoserver/wfs",
 *              featureType: "tasmania_roads",
 *              featureNS: "http://www.openplans.org/topp"
 *          }),
 *          abortPrevious: true
 *      });
 *
 *      formPanel.getForm().doAction(searchAction, {
 *          callback: function(response) {
 *              // response.features includes the features read
 *              // from the server through the protocol
 *          }
 *      });
 */

/** api: constructor
 *  .. class:: SearchAction(form, options)
 *
 *      A specific ``Ext.form.Action`` to be used when using a form to do
 *      trigger search requests througn an ``OpenLayers.Protocol``.
 *
 *      Arguments:
 *
 *      * form ``Ext.form.BasicForm`` A basic form instance.
 *      * options ``Object`` Options passed to the protocol'read method
 *            One can add an abortPrevious property to these options, if set
 *            to true, the abort method will be called on the protocol if
 *            there's a pending request.
 *
 *      When run this action builds an ``OpenLayers.Filter`` from the form
 *      and passes this filter to its protocol's read method. The form fields
 *      must be named after a specific convention, so that an appropriate 
 *      ``OpenLayers.Filter.Comparison`` filter is created for each
 *      field.
 *
 *      For example a field with the name ``foo__like`` would result in an
 *      ``OpenLayers.Filter.Comparison`` of type
 *      ``OpenLayers.Filter.Comparison.LIKE`` being created.
 *
 *      Here is the convention:
 *
 *      * ``<name>__eq: OpenLayers.Filter.Comparison.EQUAL_TO``
 *      * ``<name>__ne: OpenLayers.Filter.Comparison.NOT_EQUAL_TO``
 *      * ``<name>__lt: OpenLayers.Filter.Comparison.LESS_THAN``
 *      * ``<name>__le: OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO``
 *      * ``<name>__gt: OpenLayers.Filter.Comparison.GREATER_THAN``
 *      * ``<name>__ge: OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO``
 *      * ``<name>__like: OpenLayers.Filter.Comparison.LIKE``
 *
 *      In most cases your would not directly create ``GeoExt.form.SearchAction``
 *      objects, but use :class:`GeoExt.form.FormPanel` instead.
 */
Ext.define('GeoExt.form.action.Search', {
    extend: 'Ext.form.Action',
    alternateClassName: 'GeoExt.form.SearchAction',
    alias: 'formaction.search',
    requires: ['GeoExt.Form'],

    /** private: property[type]
     *  ``String`` The action type string.
     */
    type: "search",

    /** api: property[response]
     *  ``OpenLayers.Protocol.Response`` A reference to the response
     *  resulting from the search request. Read-only.
     */
    response: null,

    /** private: method[run]
     *  Run the action.
     */
    run: function() {
        var form = this.form,
            f = GeoExt.Form.toFilter(form, this.logicalOp, this.wildcard);
        if(this.clientValidation === false || form.isValid()){

            if (this.abortPrevious && form.prevResponse) {
                this.protocol.abort(form.prevResponse);
            }

            this.form.prevResponse = this.protocol.read(
                Ext.applyIf({
                    filter: f,
                    callback: this.handleResponse,
                    scope: this
                }, this.readOptions)
            );

        } else if(this.clientValidation !== false){
            // client validation failed
            this.failureType = Ext.form.action.Action.CLIENT_INVALID;
            form.afterAction(this, false);
        }
    },

    /** private: method[handleResponse]
     *  :param response: ``OpenLayers.Protocol.Response`` The response
     *  object.
     *
     *  Handle the response to the search query.
     */
    handleResponse: function(response) {
        var form = this.form;
        form.prevResponse = null;
        this.response = response;
        if(response.success()) {
            form.afterAction(this, true);
        } else {
            form.afterAction(this, false);
        }
        if(this.callback) {
            this.callback.call(this.scope, response);
        }
    }
});
