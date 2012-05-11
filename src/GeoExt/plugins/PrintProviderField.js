/**
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */

/** 
 *  @class GeoExt.plugins.PrintProviderField
 *  
 *  A plugin for Ext.form.Field components which provides synchronization
 *  with a GeoExt.data.PrintProvider.
 *  
 *  A form with combo boxes for layout and resolution, and a text field for a
 *  map title. The latter is a custom parameter to the print module, which is
 *  a default for all print pages. For setting custom parameters on the page
 *  level, use GeoExt.plugins.PrintPageField.
 * 
 *     
 *     var printProvider = Ext.create('GeoExt.data.PrintProvider', {
 *         capabilities: printCapabilities
 *     });
 *     Ext.create('Ext.form.FormPanel', {
 *         renderTo: "form",
 *         width: 200,
 *         height: 300,
 *         items: [{
 *             xtype: "combo",
 *             displayField: "name",
 *             store: printProvider.layouts, // printProvider.layout
 *             fieldLabel: "Layout",
 *             typeAhead: true,
 *             mode: "local",
 *             forceSelection: true,
 *             triggerAction: "all",
 *             selectOnFocus: true,
 *             plugins: Ext.create('GeoExt.plugins.PrintProviderField', {
 *                 printProvider: printProvider
 *             })
 *         }, {
 *             xtype: "combo",
 *             displayField: "name",
 *             store: printProvider.dpis, // printProvider.dpi
 *             fieldLabel: "Resolution",
 *             typeAhead: true,
 *             mode: "local",
 *             forceSelection: true,
 *             triggerAction: "all",
 *             selectOnFocus: true,
 *             plugins: Ext.create('GeoExt.plugins.PrintProviderField', {
 *                 printProvider: printProvider
 *             })
 *         }, {
 *             xtype: "textfield",
 *             name: "mapTitle", // printProvider.customParams.mapTitle
 *             fieldLabel: "Map Title",
 *             plugins: Ext.create('GeoExt.plugins.PrintProviderField', {
 *                 printProvider: printProvider
 *             })
 *         }]
 *     }):
 */
Ext.define('GeoExt.plugins.PrintProviderField', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: ['GeoExt.data.PrintProvider', 'Ext.form.field.ComboBox'],
    alias : 'widget.gx_printproviderfield',
    alternateClassName : 'GeoExt.PrintProviderField',
    
    /** 
     * @cfg {GeoExt.data.PrintProvider} printProvider
     * The print provider to use with this
     * plugin's field. Not required if set on the owner container of the
     * field.
     */
    
    /**
     * @private 
     * @property {Ext.form.Field} target
     * This plugin's target field.
     */
    target: null,
    
    /** 
     * @private
     */
    constructor: function(config) {
        this.initialConfig = config;
        Ext.apply(this, config);
        
        this.callParent(arguments);
    },
    
    /** 
     * @private
     * @param {Ext.form.Field} target The component that this plugin extends.
     */
    init: function(target) {
        this.target = target;
        var onCfg = {
            scope: this,
            "render": this.onRender,
            "beforedestroy": this.onBeforeDestroy
        };
        onCfg[target instanceof Ext.form.ComboBox ? "select" : "change"] =
            this.onFieldChange;
        target.on(onCfg);
    },
    
    /** 
     * Handler for the target field's "render" event.
     *
     * @private
     * @param {Ext.Form.Field} field
     */
    onRender: function(field) {
        var printProvider = this.printProvider || field.ownerCt.printProvider;
        if(field.store === printProvider.layouts) {
            field.setValue(printProvider.layout.get(field.displayField));
            printProvider.on({
                "layoutchange": this.onProviderChange,
                scope: this
            });
        } else if(field.store === printProvider.dpis) {
            field.setValue(printProvider.dpi.get(field.displayField));
            printProvider.on({
                "dpichange": this.onProviderChange,
                scope: this
            });
        } else if(field.initialConfig.value === undefined) {
            field.setValue(printProvider.customParams[field.name]);
        }
    },
    
    /** 
     * Handler for the target field's "change" or "select" event.
     * 
     * @private
     * @param {Ext.form.Field} field
     * @param {Ext.data.Record} record Optional.
     */
    onFieldChange: function(field, records) {
        var record;
        if (Ext.isArray(records)) {
            record = records[0];
        } else {
            record = records;
        }
        var printProvider = this.printProvider || field.ownerCt.printProvider;
        var value = field.getValue();
        this._updating = true;
        if(record) {
            switch(field.store) {
                case printProvider.layouts:
                    printProvider.setLayout(record);
                    break;
                case printProvider.dpis:
                    printProvider.setDpi(record);
                    break;
            }
        } else {
            printProvider.customParams[field.name] = value;
        }
        delete this._updating;
    },
    
    /** 
     * Handler for the printProvider's dpichange and layoutchange event
     *
     * @private
     * @param {GeoExt.data.PrintProvider}  printProvider
     * @param {Ext.data.Record}  rec
     */
    onProviderChange: function(printProvider, rec) {
        if(!this._updating) {
            this.target.setValue(rec.get(this.target.displayField));
        }
    },
    
    /** 
     * @private
     */
    onBeforeDestroy: function() {
        var target = this.target;
        target.un("beforedestroy", this.onBeforeDestroy, this);
        target.un("render", this.onRender, this);
        target.un("select", this.onFieldChange, this);
        target.un("valid", this.onFieldChange, this);
        var printProvider = this.printProvider || target.ownerCt.printProvider;
        printProvider.un("layoutchange", this.onProviderChange, this);
        printProvider.un("dpichange", this.onProviderChange, this);
    }

});

