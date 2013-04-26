/*
 * Copyright (c) 2008-2013 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/*
 * @requires GeoExt/container/LayerLegend.js
 * @include GeoExt/FeatureRenderer.js
 */

/**
 * Create a vector legend.
 * @class GeoExt.container.VectorLegend
 */
Ext.define('GeoExt.container.VectorLegend', {
    extend: 'GeoExt.container.LayerLegend',
    alias: 'widget.gx_vectorlegend',
    requires: [
        'Ext.layout.container.Column', 
        'GeoExt.FeatureRenderer'
    ],
    alternateClassName: 'GeoExt.VectorLegend',
    
    statics: {
        supports: function(layerRecord) {
            return layerRecord.getLayer() instanceof OpenLayers.Layer.Vector ? 1 : 0;
        }
    },

    /** @cfg {GeoExt.data.LayerRecord}
     * The record containing a vector layer that this legend will be based on.  
     * One of ``layerRecord``, ``layer``,  or ``rules`` must be specified in 
     * the config.
     */
    layerRecord: null,

    /** @cfg {OpenLayers.Layer.Vector}
     * The layer that this legend will be based on.  One of ``layer``, 
     * ``rules``, or ``layerRecord`` must be specified in the config.
     */
    layer: null,

    /** @cfg {Array}
     * List of rules.  One of ``rules``, ``layer``, or ``layerRecord`` must be 
     * specified in the config.  The ``symbolType`` property must also be
     * provided if only ``rules`` are given in the config.
     */
    rules: null,

    /** @cfg {String}
     * The symbol type for legend swatches.  Must be one of ``"Point"``, 
     * ``"Line"``, or ``"Polygon"``.  If not provided, the ``layer`` or
     * ``layerRecord`` config property must be specified, and the geometry type
     * of the first feature found on the layer will be used. If a rule does
     * not have a symbolizer for ``symbolType``, we look at the symbolizers
     * for the rule, and see if it has a ``"Point"``, ``"Line"`` or
     * ``"Polygon"`` symbolizer, which we use for rendering a swatch of the
     * respective geometry type. 
     */
    symbolType: null,

    /** @cfg {String}
     * The prefix to use as a title for rules with no title or
     * name.  Default is ``"Untitled "``.  Prefix will be appended with a
     * number that corresponds to the index of the rule (1 for first rule).
     */
    untitledPrefix: "Untitled ",

    /** @cfg {Boolean}
     * Set cursor style to "pointer" for symbolizers.  Register for
     * the ``symbolclick`` event to handle clicks.  Note that click events
     * are fired regardless of this value.  If ``false``, no cursor style will
     * be set.  Default is ``false``.
     */
    clickableSymbol: false,

    /** @cfg {Boolean}
     * Set cursor style to "pointer" for rule titles.  Register for
     * the ``titleclick`` event to handle clicks.  Note that click events
     * are fired regardless of this value.  If ``false``, no cursor style will
     * be set.  Default is ``false``.
     */
    clickableTitle: false,

    /** @cfg {Boolean}
     * Set to true if a rule should be selected by clicking on the
     * symbol or title. Selection will trigger the ruleselected event, and
     * a click on a selected rule will unselect it and trigger the
     * ``ruleunselected`` event. Default is ``false``.
     */
    selectOnClick: false,

    /** @cfg {Boolean}
     * Allow drag and drop of rules. Default is ``false``.
     */
    enableDD: false,

    /** @cfg {Boolean}
     * Show a border around the legend panel. Default is ``false``.
     */
    bodyBorder: false,
          
    /** @property {OpenLayers.Feature.Vector}
     * @private
     * Cached feature for rendering.
     */
    feature: null,
    
    /** @property {OpenLayers.Rule}
     * @private
     * The rule that is currently selected.
     */
    selectedRule: null,

    /** @property {Number}
     * @private
     * The current scale denominator of any map associated with this
     * legend.  Use :meth`setCurrentScaleDenominator` to change this.  If not
     * set an entry for each rule will be rendered.  If set, only rules that
     * apply for the given scale will be rendered.
     */
    currentScaleDenominator: null,
    
    initComponent: function(){
        var me = this;
        me.callParent();

        if (this.layerRecord) {
            this.layer = this.layerRecord.getLayer();
            if (this.layer.map) {
                this.map = this.layer.map;
                this.currentScaleDenominator = this.layer.map.getScale();
                this.layer.map.events.on({
                    "zoomend": this.onMapZoom,
                    scope: this
                });
            }
        }
        
        // determine symbol type
        if (!this.symbolType) {
            if (this.feature) {
                this.symbolType = this.symbolTypeFromFeature(this.feature);
            } else if (this.layer) {
                if (this.layer.features.length > 0) {
                    var feature = this.layer.features[0].clone();
                    feature.attributes = {};
                    this.feature = feature;
                    this.symbolType = this.symbolTypeFromFeature(this.feature);
                } else {
                    this.layer.events.on({
                        featuresadded: this.onFeaturesAdded,
                        scope: this
                    });
                }
            }
        }
        
        // set rules if not provided
        if (this.layer && this.feature && !this.rules) {
            this.setRules();
        }

        this.rulesContainer = new Ext.container.Container({
            autoEl: {}
        });
        
        this.add(this.rulesContainer);
        
        this.addEvents(
            /** 
             * @event titleclick
             * Fires when a rule title is clicked.
             * @param {GeoExt.VectorLegend} comp This component.
             * @param {OpenLayers.Rule} rule The rule whose title was clicked.
             */
            "titleclick", 

            /** 
             * @event symbolclick
             * Fires when a rule symbolizer is clicked.
             * @param {GeoExt.VectorLegend} comp This component.
             * @param {OpenLayers.Rule} rule The rule whose symbol was clicked.
             */
            "symbolclick",

            /** 
             *  @event ruleclick
             *  Fires when a rule entry is clicked (fired with symbolizer or
             *  title click).
             *  @param {GeoExt.VectorLegend} comp This component.
             *  @param {OpenLayers.Rule} rule The rule that was clicked.
             */
            "ruleclick",
            
            /** 
             * @event ruleselected
             * Fires when a rule is clicked and ``selectOnClick`` is set to 
             * ``true``.
             * @param {GeoExt.VectorLegend} comp This component.
             * @param {OpenLayers.Rule} rule The rule that was selected.
             */
            "ruleselected",
            
            /** 
             * @event ruleunselected
             * Fires when the selected rule is clicked and ``selectOnClick`` 
             * is set to ``true``, or when a rule is unselected by selecting a
             * different one.
             * @param {GeoExt.VectorLegend} comp This component.
             * @param {OpenLayers.Rule} rule The rule that was unselected.
             */
            "ruleunselected",
            
            /** 
             * @event rulemoved
             * Fires when a rule is moved.
             * @param {GeoExt.VectorLegend} comp This component.
             * @param {OpenLayers.Rule} rule The rule that was moved.
             */
            "rulemoved"
        ); 
        
        this.update();
 
    },
    
   /**
    * Listener for map zoomend.
    * @private
    */
    onMapZoom: function() {
        this.setCurrentScaleDenominator(
            this.layer.map.getScale()
        );
    },
    
    /** 
     * Determine the symbol type given a feature.
     * @private
     * @param {OpenLayers.Feature.Vector} feature
     */
    symbolTypeFromFeature: function(feature) {
        var match = feature.geometry.CLASS_NAME.match(/Point|Line|Polygon/);
        return (match && match[0]) || "Point";
    },
    
    /**
     * Set as a one time listener for the ``featuresadded`` event on the layer
     * if it was provided with no features originally.
     * @private
     */
    onFeaturesAdded: function() {
        this.layer.events.un({
            featuresadded: this.onFeaturesAdded,
            scope: this
        });
        var feature = this.layer.features[0].clone();
        feature.attributes = {};
        this.feature = feature;
        this.symbolType = this.symbolTypeFromFeature(this.feature);
        if (!this.rules) {
            this.setRules();
        }
        this.update();
    },
    
    /** 
     * Sets the ``rules`` property for this.  This is called when the component
     * is constructed without rules.  Rules will be derived from the layer's 
     * style map if it has one.
     * @private
     */
    setRules: function() {
        var style = this.layer.styleMap && this.layer.styleMap.styles["default"];
        if (!style) {
            style = new OpenLayers.Style();
        }
        if (style.rules.length === 0) {
            this.rules = [
                new OpenLayers.Rule({
                    title: style.title,
                    symbolizer: style.createSymbolizer(this.feature)
                })
            ];
        } else {
            this.rules = style.rules;                
        }
    },
    
    /**
     * Set the current scale denominator.  This will hide entries for any
     * rules that don't apply at the current scale.
     * @param {Number} scale The scale denominator.
     */
    setCurrentScaleDenominator: function(scale) {
        if (scale !== this.currentScaleDenominator) {
            this.currentScaleDenominator = scale;
            this.update();
        }
    },

    /** 
     * Get the item corresponding to the rule.
     * @private
     * @param {OpenLayers.Rule} rule
     * @return {Ext.Container}
     */
    getRuleEntry: function(rule) {
        var idxOfRule = Ext.Array.indexOf(this.rules, rule);
        return this.rulesContainer.items.get(idxOfRule);
    },

    /** 
     * Add a new rule entry in the rules container. This
     * method does not add the rule to the rules array.
     * @private
     * @param {OpenLayers.Rule} rule
     * @param {Boolean} noDoLayout: Don't call doLayout after adding rule.
     * Default is ``false``.
     */
    addRuleEntry: function(rule, noDoLayout) {
        this.rulesContainer.add(this.createRuleEntry(rule));
        if (!noDoLayout) {
            this.doLayout();
        }
    },

    /** 
     * Remove a rule entry from the rules container, this
     * method assumes the rule is in the rules array, and
     * it does not remove the rule from the rules array.
     * @private
     * @param {OpenLayers.Rule} rule
     * @param {Boolean} noDoLayout Don't call doLayout after removing rule.
     * Default is ``false``.
     */
    removeRuleEntry: function(rule, noDoLayout) {
        var ruleEntry = this.getRuleEntry(rule);
        if (ruleEntry) {
            this.rulesContainer.remove(ruleEntry);
            if (!noDoLayout) {
                this.doLayout();
            }
        }
    },
    
    selectRuleEntry: function(rule) {
        var newSelection = rule != this.selectedRule;
        if (this.selectedRule) {
            this.unselect();
        }
        if (newSelection) {
            var ruleEntry = this.getRuleEntry(rule);
            ruleEntry.body.addClass("x-grid3-row-selected");
            this.selectedRule = rule;
            this.fireEvent("ruleselected", this, rule);
        }
    },
    
    unselect: function() {
        this.rulesContainer.items.each(function(item, i) {
            if (this.rules[i] == this.selectedRule) {
                item.body.removeClass("x-grid3-row-selected");
                this.selectedRule = null;
                this.fireEvent("ruleunselected", this, this.rules[i]);
            }
        }, this);
    },

    createRuleEntry: function(rule) {
        var applies = true;
        if (this.currentScaleDenominator != null) {
            if (rule.minScaleDenominator) {
                applies = applies && (this.currentScaleDenominator >= rule.minScaleDenominator);
            }
            if (rule.maxScaleDenominator) {
                applies = applies && (this.currentScaleDenominator < rule.maxScaleDenominator);
            }
        }
        return {
            xtype: "panel",
            layout: "column",
            border: false,
            hidden: !applies,
            bodyStyle: this.selectOnClick ? {cursor: "pointer"} : undefined,
            defaults: {
                border: false
            },
            items: [
                this.createRuleRenderer(rule),
                this.createRuleTitle(rule)
            ],
            listeners: {
                render: function(comp){
                    this.selectOnClick && comp.getEl().on({
                        click: function(comp){
                            this.selectRuleEntry(rule);
                        },
                        scope: this
                    });
                    if (this.enableDD == true) {
                        this.addDD(comp);
                    }
                },
                scope: this
            }
        };
    },

    /** 
     * Create a renderer for the rule.
     * @private
     * @param {OpenLayers.Rule} rule
     * @return {GeoExt.FeatureRenderer}
     */
    createRuleRenderer: function(rule) {
        var types = [this.symbolType, "Point", "Line", "Polygon"];
        var type, haveType;
        var symbolizers = rule.symbolizers;
        var i, len;
        if (!symbolizers) {
            // TODO: remove this when OpenLayers.Symbolizer is used everywhere
            var symbolizer = rule.symbolizer;
            for (i=0, len=types.length; i<len; ++i) {
                type = types[i];
                if (symbolizer[type]) {
                    symbolizer = symbolizer[type];
                    haveType = true;
                    break;
                }
            }
            symbolizers = [symbolizer];
        } else {
            var Type;
            outer: for (i=0, ii=types.length; i<ii; ++i) {
                type = types[i];
                Type = OpenLayers.Symbolizer[type];
                if (Type) {
                    for (var j=0, jj=symbolizers.length; j<jj; ++j) {
                        if (symbolizers[j] instanceof Type) {
                            haveType = true;
                            break outer;
                        }
                    }
                }
            }
        }
        return {
            xtype: "gx_renderer",
            symbolType: haveType ? type : this.symbolType,
            symbolizers: symbolizers,
            style: this.clickableSymbol ? {cursor: "pointer"} : undefined,
            listeners: {
                click: function() {
                    if (this.clickableSymbol) {
                        this.fireEvent("symbolclick", this, rule);
                        this.fireEvent("ruleclick", this, rule);
                    }
                },
                scope: this
            }
        };
    },

    /** 
     * Create a title component for the rule.
     * @private
     * @param {OpenLayers.Rule} rule
     * @return {Ext.Component}
     */
    createRuleTitle: function(rule) {
        return {
            cls: "x-form-item",
            style: "padding: 0.2em 0.5em 0;", // TODO: css
            bodyStyle: Ext.applyIf({background: "transparent"}, 
                this.clickableTitle ? {cursor: "pointer"} : undefined),
            html: this.getRuleTitle(rule),
            listeners: {
                render: function(comp) {
                    this.clickableTitle && comp.getEl().on({
                        click: function() {
                            this.fireEvent("titleclick", this, rule);
                            this.fireEvent("ruleclick", this, rule);
                        },
                        scope: this
                    });
                },
                scope: this
            }
        };
    },
    
    /** 
     * Adds drag & drop functionality to a rule entry.
     * @private
     * @param {Ext.Component} component
     */
    addDD: function(component) {
        var ct = component.ownerCt;
        var panel = this;
        new Ext.dd.DragSource(component.getEl(), {
            ddGroup: ct.id,
            onDragOut: function(e, targetId) {
                var target = Ext.getCmp(targetId);
                target.removeClass("gx-ruledrag-insert-above");
                target.removeClass("gx-ruledrag-insert-below");
                return Ext.dd.DragZone.prototype.onDragOut.apply(this, arguments);
            },
            onDragEnter: function(e, targetId) {
                var target = Ext.getCmp(targetId);
                var cls;
                var sourcePos = Ext.Array.indexOf(ct.items, component);
                var targetPos = Ext.Array.indexOf(ct.items, target);
                if (sourcePos > targetPos) {
                    cls = "gx-ruledrag-insert-above";
                } else if (sourcePos < targetPos) {
                    cls = "gx-ruledrag-insert-below";
                }                
                cls && target.addClass(cls);
                return Ext.dd.DragZone.prototype.onDragEnter.apply(this, arguments);
            },
            onDragDrop: function(e, targetId) {
                var indexOf = Ext.Array.indexOf,
                    idxOfComp = indexOf(ct.items, component),
                    idxOfTarget = indexOf(ct.items, Ext.getCmp(targetId));
                panel.moveRule(idxOfComp, idxOfTarget);
                return Ext.dd.DragZone.prototype.onDragDrop.apply(this, arguments);
            },
            getDragData: function(e) {
                var sourceEl = e.getTarget(".x-column-inner");
                if(sourceEl) {
                    var d = sourceEl.cloneNode(true);
                    d.id = Ext.id();
                    return {
                        sourceEl: sourceEl,
                        repairXY: Ext.fly(sourceEl).getXY(),
                        ddel: d
                    };
                }
            }
        });
        new Ext.dd.DropTarget(component.getEl(), {
            ddGroup: ct.id,
            notifyDrop: function() {
                return true;
            }
        });
    },
    
    /** 
     * Update rule titles and symbolizers.
     */
    update: function() {
        this.callParent(arguments);
        if (this.symbolType && this.rules) {
            this.rulesContainer.removeAll(false);
            for (var i=0, ii=this.rules.length; i<ii; ++i) {
                this.addRuleEntry(this.rules[i], true);
            }
            this.doLayout();
            // make sure that the selected rule is still selected after update
            if (this.selectedRule) {
                this.getRuleEntry(this.selectedRule).body.addClass("x-grid3-row-selected");
            }
        }
    },

    /**
     * Update the renderer and the title of a rule.
     * @private
     * @param {OpenLayers.Rule} rule
     */
    updateRuleEntry: function(rule) {
        var ruleEntry = this.getRuleEntry(rule);
        if (ruleEntry) {
            ruleEntry.removeAll();
            ruleEntry.add(this.createRuleRenderer(rule));
            ruleEntry.add(this.createRuleTitle(rule));
            ruleEntry.doLayout();
        }
    },
    
    moveRule: function(sourcePos, targetPos) {
        var srcRule = this.rules[sourcePos];
        this.rules.splice(sourcePos, 1);
        this.rules.splice(targetPos, 0, srcRule);
        this.update();
        this.fireEvent("rulemoved", this, srcRule);
    },
    
    /** 
     * Get a rule title given a rule.
     * @private
     * @return {String}
     */
    getRuleTitle: function(rule) {
        var title = rule.title || rule.name || "";
        if (!title && this.untitledPrefix) {
            title = this.untitledPrefix + (Ext.Array.indexOf(this.rules, rule) + 1);
        }
        return title;
    },

    beforeDestroy: function() {
        if (this.layer) {
            if (this.layer.events) {
                this.layer.events.un({
                    featuresadded: this.onFeaturesAdded,
                    scope: this
                });
            }
            if (this.layer.map && this.layer.map.events) {
                this.layer.map.events.un({
                    "zoomend": this.onMapZoom,
                    scope: this
                });
            }
        }
        delete this.layer;
        delete this.map;
        delete this.rules;
        this.callParent(arguments);
    },

    /**
     * Handler for remove event of the layerStore
     * @private
     * @param {Ext.data.Store} store The store from which the record was
     * removed.
     * @param {Ext.data.Record} record The record object corresponding
     * to the removed layer.
     * @param {Integer} index The index in the store.
     */
    onStoreRemove: function(store, record, index) {
        if (record.getLayer() === this.layer) {
            if (this.map && this.map.events) {
                this.map.events.un({
                    "zoomend": this.onMapZoom,
                    scope: this
                });
            }
        }
    },

    /** 
     * Handler for add event of the layerStore
     * @private
     * @param {Ext.data.Store} store The store to which the record was
     * added.
     * @param {Ext.data.Record[]} records The record object(s) corresponding
     * to the added layer(s).
     * @param {Integer} index The index in the store at which the record
     * was added.
     */
    onStoreAdd: function(store, records, index) {
        for (var i=0, len=records.length; i<len; i++) {
            var record = records[i];
            if (record.getLayer() === this.layer) {
                if (this.layer.map && this.layer.map.events) {
                    this.layer.map.events.on({
                        "zoomend": this.onMapZoom,
                        scope: this
                    });
                }
            }
       }
    }

}, function() {
    GeoExt.container.LayerLegend.types["gx_vectorlegend"] = GeoExt.container.VectorLegend;
});
