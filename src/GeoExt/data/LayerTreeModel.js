/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/**
 * Model for trees that use GeoExt tree components. It can also hold plain
 * Ext JS layer nodes.
 *
 * This model adds several fields that are specific to tree extensions
 * provided by GeoExt:
 *
 * * **plugins** Object[]: The plugins for this node.
 * * **layer** OpenLayers.Layer: The layer this node is connected to.
 * * **container** Ext.AbstractPlugin: The instance of a container plugin.
 *   Read only.
 * * **checkedGroup** String: An identifier for a group of mutually exclusive
 *   layers. If set, the node will render with a radio button instead of a
 *   checkbox.
 * * **fixedText** Boolean: Used to determine if a node's name should change.
 *   dynamically if the name of the connected layer changes, if any. Read only.
 * * **component** Ext.Component: The component to be rendered with this node,
 *   if any.
 *
 * A typical configuration that makes use of some of these extended sttings
 * could look like this:
 *
 *     {
 *         plugins: [{ptype: 'gx_layer'}],
 *         layer: myLayerRecord.getLayer(),
 *         checkedGroup: 'natural',
 *         component: {
 *             xtype: "gx_wmslegend",
 *             layerRecord: myLayerRecord,
 *             showTitle: false
 *         }
 *     }
 *
 * The above creates a node with a GeoExt.tree.LayerNode plugin, and connects
 * it to a layer record that was previously assigned to the myLayerRecord
 * variable. The node will be rendered with a GeoExt.container.WmsLegend,
 * configured with the same layer.
 *
 * @class GeoExt.data.LayerTreeModel
 */
Ext.define('GeoExt.data.LayerTreeModel',{
    alternateClassName: 'GeoExt.data.LayerTreeRecord',
    extend: 'Ext.data.Model',
    requires: [
        'Ext.data.proxy.Memory',
        'Ext.data.reader.Json',
        'GeoExt.Version'
    ],
    alias: 'model.gx_layertree',
    fields: [
        {name: 'text', type: 'string'},
        {name: 'plugins'},
        {name: 'layer'},
        {name: 'container'},
        {name: 'checkedGroup', type: 'string'},
        {name: 'fixedText', type: 'bool'},
        {name: 'component'}
    ],
    proxy: {
        type: "memory"
    },

    // TODO This is also been used in WmsLegend, refactor so this can be reused
    // or shared
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
     * Turns a given recordname into a string suitable for usage as an
     * itemId-property. See {Ext.Component#itemId}:
     *
     * "Valid identifiers start with a letter or underscore and are followed
     * by (optional) additional letters, underscores, digits or hyphens."
     *
     * @param {String} name The recordname to convert.
     * @return {String} A string that is now ready to be used as itemId.
     */
    recordnameToItemId: function(name){
        var me = this,
            layername = name ? "" + name : "",
            prefix = me.itemIdPrefix,
            validIdRe = me.validIdRe,
            illegalItemIdRe = me.illegalItemIdRe,
            replace = "-",
            itemId;

        if (validIdRe.test(layername)) {
            itemId = layername;
        } else {
            itemId = prefix + layername.replace(illegalItemIdRe, replace);
        }
        return itemId
    },

    /**
     * Fires after the node's fields were modified.
     *
     * @event afteredit
     * @param {GeoExt.data.LayerTreeModel} this This model instance.
     * @param {String[]} modifiedFieldNames The names of the fields that were
     * edited.
     */

    /**
     * @private
     * Method arguments vary between ExtJS4 and ExtJS5
     */
    constructor: function(data) {
        var me = this;

        me.callParent(arguments);

        window.setTimeout(function() {
            var plugins = me.get('plugins');

            if (plugins) {
                var plugin, instance;
                for (var i=0, ii=plugins.length; i<ii; ++i) {
                    plugin = plugins[i];
                    instance = Ext.PluginMgr.create(Ext.isString(plugin) ? {
                        ptype: plugin
                    } : plugin);
                    instance.init(me);
                }
            }
        });
    },

    init: function(){
        var me = this;
        me.id = me.recordnameToItemId(me.id);
    },

    // TODO this isn't called anymore find another way for checking if checkchange
    // In ExtJS5 this is called by the private callJoined-method with the first argument
    // 'afterEdit'. We can not override this method as ExtJS raises warning when overwriting
    // private methods.
    /**
     * Fires the #afteredit event after the node's fields were modified.
     *
     * @private
     */
    afterEdit: function(modifiedFieldNames) {
        var me = this;
        me.callParent(arguments);
        me.fireEvent('afteredit', me, modifiedFieldNames);
    }
});