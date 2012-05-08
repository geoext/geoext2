/**
 * Copyright (c) 2008-2010 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */
/**
 *
 *  Sample code to create a toolbar with an OpenLayers control into it.
 *  Base class is [Ext.Action](http://dev.sencha.com/deploy/dev/docs/?class=Ext.Action)
 *
 *      @example
 *      var action = new GeoExt.Action({
 *          text: "max extent",
 *          control: new OpenLayers.Control.ZoomToMaxExtent(),
 *          map: map
 *      });
 *      var toolbar = new Ext.Toolbar([action]);
 *
 */
Ext.define('GeoExt.Action', {
    extend: 'Ext.Action',
    alias : 'widget.gx_action',
    
    /**
     * @cfg {OpenLayers.Control}
     * The OpenLayers control wrapped in this action.
     */
    control: null,
    
    /**
     * @cfg {OpenLayers.Map}
     *  The OpenLayers map that the control should be added
     *  to.  For controls that don't need to be added to a map or have already
     *  been added to one, this config property may be omitted.
     */
    map: null,
    
    /**
     * @private
     * @cfg {Object}
     *  The user-provided scope, used when calling uHandler,
     *  uToggleHandler, and uCheckHandler.
     */
    uScope: null,
    
    /**
     * @private
     * @cfg {Function}
     *  References the function the user passes through
     *  the "handler" property.
     */
    uHandler: null,
    
    /**
     * @private
     * @cfg {Function}
     *  References the function the user passes through
     *  the "toggleHandler" property.
     */
    uToggleHandler: null,
    
    /**
     * @private
     * @cfg {Function}
     *  References the function the user passes through
     *  the "checkHandler" property.
     */
    uCheckHandler: null,
    
    /** 
     * Create a GeoExt.Action instance. A GeoExt.Action is created to insert
     * an OpenLayers control in a toolbar as a button or in a menu as a menu
     * item. A GeoExt.Action instance can be used like a regular Ext.Action,
     * look at the Ext.Action API doc for more detail.
     * 
     * @private
     */
    constructor: function(config){
        // store the user scope and handlers
        this.uScope = config.scope;
        this.uHandler = config.handler;
        this.uToggleHandler = config.toggleHandler;
        this.uCheckHandler = config.checkHandler;
        
        config.scope = this;
        config.handler = this.pHandler;
        config.toggleHandler = this.pToggleHandler;
        config.checkHandler = this.pCheckHandler;
        
        // set control in the instance, the Ext.Action
        // constructor won't do it for us
        var ctrl = this.control = config.control;
        delete config.control;
        
        // register "activate" and "deactivate" listeners
        // on the control
        if (ctrl) {
            // If map is provided in config, add control to map.
            if (config.map) {
                config.map.addControl(ctrl);
                delete config.map;
            }
            if ((config.pressed || config.checked) && ctrl.map) {
                ctrl.activate();
            }
            ctrl.events.on({
                activate: this.onCtrlActivate,
                deactivate: this.onCtrlDeactivate,
                scope: this
            });
        }
        
        this.callParent(arguments);
    },
    
    /**
     * @private
     * @param {Ext.Component} The component that triggers the handler.
     *
     *  The private handler.
     */
    pHandler: function(cmp){
        var ctrl = this.control;
        if (ctrl &&
        ctrl.type == OpenLayers.Control.TYPE_BUTTON) {
            ctrl.trigger();
        }
        if (this.uHandler) {
            this.uHandler.apply(this.uScope, arguments);
        }
    },
    
    /**
     * @private
     * @param {Ext.Component} cmp The component that triggers the toggle handler.
     * @param {Boolean} state The state of the toggle.
     *
     *  The private toggle handler.
     */
    pToggleHandler: function(cmp, state){
        this.changeControlState(state);
        if (this.uToggleHandler) {
            this.uToggleHandler.apply(this.uScope, arguments);
        }
    },
    
    /**
     * @private
     * @param {Ext.Component} cmp The component that triggers the check handler.
     * @param {Boolean} state The state of the toggle.
     *
     *  The private check handler.
     */
    pCheckHandler: function(cmp, state){
        this.changeControlState(state);
        if (this.uCheckHandler) {
            this.uCheckHandler.apply(this.uScope, arguments);
        }
    },
    
    /**
     * @private
     * @param {Boolean} state The state of the toggle.
     *
     *  Change the control state depending on the state boolean.
     */
    changeControlState: function(state){
        if (state) {
            if (!this._activating) {
                this._activating = true;
                this.control.activate();
                this._activating = false;
            }
        }
        else {
            if (!this._deactivating) {
                this._deactivating = true;
                this.control.deactivate();
                this._deactivating = false;
            }
        }
    },
    
    /**
     * @private
     *
     *  Called when this action's control is activated.
     */
    onCtrlActivate: function(){
        var ctrl = this.control;
        if (ctrl.type == OpenLayers.Control.TYPE_BUTTON) {
            this.enable();
        }
        else {
            // deal with buttons
            this.safeCallEach("toggle", [true]);
            // deal with check items
            this.safeCallEach("setChecked", [true]);
        }
    },
    
    /**
     * @private
     *
     *  Called when this action's control is deactivated.
     */
    onCtrlDeactivate: function(){
        var ctrl = this.control;
        if (ctrl.type == OpenLayers.Control.TYPE_BUTTON) {
            this.disable();
        }
        else {
            // deal with buttons
            this.safeCallEach("toggle", [false]);
            // deal with check items
            this.safeCallEach("setChecked", [false]);
        }
    },
    
    /**
     * @private
     *
     */
    safeCallEach: function(fnName, args){
        var cs = this.items;
        for (var i = 0, len = cs.length; i < len; i++) {
            if (cs[i][fnName]) {
                cs[i].rendered ? cs[i][fnName].apply(cs[i], args) : cs[i].on({
                    "render": cs[i][fnName].bind(cs[i][fnName], cs.scope, args, false),
                    single: true
                });
            }
        }
    }
});
