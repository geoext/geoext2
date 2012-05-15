/**
 * @class GeoExt.plugins.PrintPageField
 * 
 * A plugin for `Ext.form.Field` components which provides synchronization
 *  with a {@link GeoExt.data.PrintPage}. The field name has to match the
 *  respective property of the printPage (e.g. `scale`, `rotation`).
 *      
 * A form with a combo box for the scale and text fields for rotation and a
 *  page title. The page title is a custom parameter of the print module's
 *  page configuration:
 *      
 *      @example
 *      var printPage = Ext.create('GeoExt.data.PrintPage'{
 *          printProvider: Ext.create('GeoExt.data.MapfishPrintProvider', {
 *              capabilities: printCapabilities
 *          })
 *      });
 *      Ext.create('Ext.form.FormPanel', {
 *          renderTo: "form",
 *          width: 200,
 *          height: 300,
 *          items: [{
 *              xtype: "combo",
 *              displayField: "name",
 *              store: printPage.scales, // printPage.scale
 *              name: "scale",
 *              fieldLabel: "Scale",
 *              typeAhead: true,
 *              mode: "local",
 *              forceSelection: true,
 *              triggerAction: "all",
 *              selectOnFocus: true,
 *              plugins: new GeoExt.plugins.PrintPageField({
 *                  printPage: printPage
 *              })
 *          }, {
 *              xtype: "textfield",
 *              name: "rotation", // printPage.rotation
 *              fieldLabel: "Rotation",
 *              plugins: new GeoExt.plugins.PrintPageField({
 *                  printPage: printPage
 *              })
 *          }, {
 *              xtype: "textfield",
 *              name: "mapTitle", // printPage.customParams["mapTitle"]
 *              fieldLabel: "Map Title",
 *              plugins: new GeoExt.plugins.PrintPageField({
 *                  printPage: printPage
 *              })
 *          }]
 *      });
 *      
 */
Ext.define('GeoExt.plugins.PrintPageField', {
    mixins: {
        observable: 'Ext.util.Observable'
    },
    requires: ['GeoExt.data.PrintPage', 'Ext.form.field.ComboBox', 'Ext.form.field.Checkbox'],
    alias : 'widget.gx_printpagefield',
    alternateClassName : 'GeoExt.PrintPageField',
    

    /** 
     * @cfg {GeoExt.data.PrintPage} printPage
     * The print page to synchronize with.
     */

    /** 
     * @private
     * @property {GeoExt.data.PrintPage} printPage
     * The print page to synchronize with.
     *  Read-only.
     */
    printPage: null,
    
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
     * @param {Ext.form.Field} target The component that this plugin
     *  extends.
     * @param {Object} target
     */
    init: function(target) {
        
        this.target = target;
        var onCfg = {
            "beforedestroy": this.onBeforeDestroy,
            scope: this
        };
        
        // the old 'check' event of 3.x is gone, only 'change' is supported
        var eventName = "change";
        if (target instanceof Ext.form.ComboBox) {
            eventName = "select";
        }
        
        onCfg[eventName] = this.onFieldChange;
        target.on(onCfg);
        this.printPage.on({
            "change": this.onPageChange,
            scope: this
        });
        this.printPage.printProvider.on({
            "layoutchange": this.onLayoutChange,
            scope: this
        });
        this.setValue(this.printPage);
    },

    /** 
     * Handler for the target field's "valid" or "select" event.
     * 
     * @private
     * @param {Ext.form.Field} field 
     * @param {Ext.data.Record[]} records Optional.
     */
    onFieldChange: function(field, records) {
        
        var record;
        if (Ext.isArray(records)) {
            record = records[0];
        } else {
            record = records;
        }
        
        var printProvider = this.printPage.printProvider;
        var value = field.getValue();
        this._updating = true;
        if(field.store === printProvider.scales || field.name === "scale") {
            this.printPage.setScale(record);
        } else if(field.name == "rotation") {
            !isNaN(value) && this.printPage.setRotation(value);
        } else {
            this.printPage.customParams[field.name] = value;
        }
        delete this._updating;
    },

    /** 
     * Handler for the "change" event for the page this plugin is configured
     *  with.
     *  
     * @private
     * @param {GeoExt.data.PrintPage} printPage 
     */
    onPageChange: function(printPage) {
        if(!this._updating) {
            this.setValue(printPage);
        }
    },
    
    /** 
     * Handler for the "layoutchange" event of the printProvider.
     * 
     * @private
     * @param {GeoExt.data.MapfishPrintProvider} printProvider
     * @param {Ext.Record} layout 
     *  
     */
    onLayoutChange: function(printProvider, layout) {
        var t = this.target;
        t.name == "rotation" && t.setDisabled(!layout.get("rotation"));
    },

    /** 
     * Sets the value in the target field.
     * 
     * @private
     * @param {GeoExt.data.PrintPage} printPage 
     */
    setValue: function(printPage) {
        var t = this.target;
        t.suspendEvents();
        if(t.store === printPage.printProvider.scales || t.name === "scale") {
            if(printPage.scale) {
                t.setValue(printPage.scale.get(t.displayField));
            }
        } else if(t.name == "rotation") {
            t.setValue(printPage.rotation);
        }
        t.resumeEvents();
    },

    /** 
     * @private
     */
    onBeforeDestroy: function() {
        this.target.un("beforedestroy", this.onBeforeDestroy, this);
        this.target.un("select", this.onFieldChange, this);
        this.target.un("valid", this.onFieldChange, this);
        this.printPage.un("change", this.onPageChange, this);
        this.printPage.printProvider.un("layoutchange", this.onLayoutChange,
            this);
    }
});