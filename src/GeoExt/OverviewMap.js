/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/**
 * A component encapsulating an OpenLayers.Control.OverviewMap control.
 *
 * When you use this component in an application, make sure to include the
 * stylesheet 'overviewmap.css' or add the following to your own stylesheet.
 *
 * <code>
 * .gx-overview-map .olControlOverviewMapElement { padding: 0; }
 * </code>
 *
 * @class GeoExt.OverviewMap
 */
Ext.define('GeoExt.OverviewMap', {
    extend: 'Ext.Component',
    alias: 'widget.gx_overviewmap',
    requires: [
        'GeoExt.Version'
    ],

    /**
     * Custom CSS class added to this components #cls.
     *
     * @property {String}
     */
    ovCls: 'gx-overview-map',

    /**
     * The OpenLayers.Map that this overview is bound to. If not set by the user
     * a gx_mappanel's map will be guessed.
     *
     * @cfg {OpenLayers.Map}
     */
    map: null,

    /**
     * If set to true the overview will be reinitialized on "baselayerchange"
     * events of its bound map.
     * This can be used to make sure that the overview shows the same baselayer
     * as the map.
     *
     * @cfg {Boolean}
     */
    dynamic: false,

    /**
     * The overview options that the underlying OpenLayers.Control.OverviewMap
     * will be initialized with. Following settings are defaults and should
     * generally not be overridden:
     *
     * - "div" configuration will default to the containers DOM element
     * - "size" will default to the containers actual dimensions
     * - "maximized" will always be true to make the overview visible
     *
     * If you want to hide the overview map, simple use the components show/hide
     * methods.
     *
     * @cfg {Object}
     */
    overviewOptions: null,

    /**
     * Reference to the OpenLayers.Control.OverviewMap control.
     *
     * @property @readonly {OpenLayers.Control.OverviewMap}
     */
    ctrl: null,

    initComponent: function() {
        if (!this.map) {
            this.map = GeoExt.panel.Map.guess().map;
        }

        // add gx class making sure it won't be overridden on accident
        this.addCls(this.ovCls);

        // bind to the components lifecycle events to make sure the overview is
        // added and removed from the map when the component is (in-)visible.
        this.on({
            'show': this.reinitControl,
            'resize': this.reinitControl,
            'hide': this.destroyControl,
            scope: this
        });

        if (this.dynamic) {
            this.map.events.on({
                changebaselayer: this.reinitControl,
                scope: this
            });
        }

        this.callParent();
    },

    /**
     * Destroys the encapsulated OpenLayers.Control.OverviewMap removing it from
     * the map controls and unbinds all events from this component.
     * Deletes the components ctrl, map and overviewOptions members.
     *
     * @private
     */
    destroy: function() {
        this.destroyControl();

        this.un({
            'show': this.reinitControl,
            'resize': this.reinitControl,
            'hide': this.destroyControl,
            scope: this
        });

        this.map.events.un({
            changebaselayer: this.onChangeBaseLayer,
            scope: this
        });

        delete this.ctrl;
        delete this.map;
        delete this.overviewOptions;

        this.callParent(arguments);
    },

    /**
     * Helper method that refers to the private initControl and destroyControl
     * methods to force an update of the overview map by bluntly creating a new one.
     * This can be called to update the map after setting new #overviewOptions.
     */
    reinitControl: function() {
        this.destroyControl();
        this.initControl();
    },

    /**
     * Initializes an OpenLayers.Control.OverviewMap control adding it to the
     * configured map.
     *
     * @private
     */
    initControl: function() {
        var map = this.map,
            size = this.getSize(),
            options = Ext.apply({
                div: this.getEl().dom,
                size: new OpenLayers.Size(size.width, size.height),
                maximized: true
            }, this.overviewOptions),
            baselayer;

        // If map is configured with allOverlays as true and layers option is
        // not set by user, the overview control will fail on construction.
        // This is to determine any layer to be shown in overview map.
        if (map.allOverlays) {
            if (!options.layers && map.layers && map.layers.length > 0) {
                baselayer = map.layers[0].clone();
                baselayer.setIsBaseLayer(true);
                options.layers = [ baselayer ];
            }
        }

        this.ctrl = new OpenLayers.Control.OverviewMap(options);
        map.addControl(this.ctrl);
    },

    /**
     * Destroys the OpenLayers.Control.OverviewMap control after removing it
     * from this components bound map.
     *
     * @private
     */
    destroyControl: function() {
        if (this.ctrl && (this.ctrl instanceof OpenLayers.Control.OverviewMap)) {
            this.map.removeControl(this.ctrl);
            this.ctrl.destroy();
        }
    }
});
