/**
 * @class GeoExt.slider.Tip
 * 
 * Create a slider tip displaying ``Ext.slider.SingleSlider`` values over slider thumbs.
 * 
 *     @example
 *     var slider = Ext.create('GeoExt.ZoomSlider', {
 *         map: panel.map,
 *         aggressive: true,                                                                                                                                                   
 *         width: 200,
 *         plugins: new GeoExt.SliderTip({
 *             getText: function(thumb) {
 *                 return Ext.String.format('<div>Scale: 1:{0}</div>', thumb.slider.getScale());
 *             }
 *         }),
 *         renderTo: document.body
 *     });
 * 
 */
Ext.define('GeoExt.slider.Tip', {
    extend : 'Ext.slider.Tip',
    alternateClassName : 'GeoExt.SliderTip',
    
    /**
     * @cfg {Boolean} hover
     * Display the tip when hovering over the thumb.  If ``false``, tip will
     *  only be displayed while dragging.  Default is ``true``.
     */
    hover: true,
    
    /**
     * @cfg {Number} minWidth
     * Minimum width of the tip.  Default is 10.
     */
    minWidth: 10,
    
    /**
     * @cfg {Array(Number)} offsets
     * A two item list that provides x, y offsets for the tip.
     */
    offsets : [0, -10],
    
    /**
     * @cfg {Boolean} dragging
     * The thumb is currently being dragged.
     */
    dragging: false,
    
    /**
     * @private
     * @param {Ext.slider.SingleSlider} slider
     * 
     * Called when the plugin is initialized.
     */
    init: function(slider) {
        this.callParent(arguments);
        if (this.hover) {
            slider.on("render", this.registerThumbListeners, this);
        }
        
        this.slider = slider;
    },
    
    /**
     * @private
     * Set as a listener for 'render' if hover is true.
     */
    registerThumbListeners: function() {
        var thumb, el;
        for (var i=0, ii=this.slider.thumbs.length; i<ii; ++i) {
            thumb = this.slider.thumbs[i];
            el = thumb.tracker.el;
            (function(thumb, el) {
                el.on({
                    mouseover: function(e) {
                        this.onSlide(this.slider, e, thumb);
                        this.dragging = false;
                    },
                    mouseout: function() {
                        if (!this.dragging) {
                            this.hide.apply(this, arguments);
                        }
                    },
                    scope: this
                });
            }).apply(this, [thumb, el]);
        }
    },

    /**
     * @private
     * @param {Ext.slider.SingleSlider} slider
     * @param {Object} e
     * @param {Object} thumb
     * 
     * Listener for dragstart and drag.
     */
    onSlide: function(slider, e, thumb) {
        this.dragging = true;
        return this.callParent(arguments);
    }

});
