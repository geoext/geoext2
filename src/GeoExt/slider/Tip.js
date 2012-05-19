/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */

/**
 * @class GeoExt.slider.Tip
 *
 * Create a slider tip displaying ``Ext.slider.SingleSlider`` values over slider thumbs.
 *
 * Example:
<pre><code>
var slider = Ext.create('GeoExt.ZoomSlider', {
    map: panel.map,
    aggressive: true,
    width: 200,
    plugins: new GeoExt.SliderTip({
        getText: function(thumb) {
            return Ext.String.format('<div>Scale: 1:{0}</div>', thumb.slider.getScale());
        }
    }),
    renderTo: document.body
});
</code></pre>
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
     * @cfg {Number[]} offsets
     * A two item list that provides x, y offsets for the tip.
     */
    offsets : [0, -10],

    /**
     * @cfg {Boolean} dragging
     * The thumb is currently being dragged.
     */
    dragging: false,

    /**
     * Called when the plugin is initialized.
     * @private
     * @param {Ext.slider.SingleSlider} slider
     */
    init: function(slider) {
        this.callParent(arguments);
        if (this.hover) {
            slider.on("render", this.registerThumbListeners, this);
        }

        this.slider = slider;
    },

    /**
     * Set as a listener for 'render' if hover is true.
     * @private
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
     * Listener for dragstart and drag.
     * @private
     * @param {Ext.slider.SingleSlider} slider
     * @param {Object} e
     * @param {Object} thumb
     */
    onSlide: function(slider, e, thumb) {
        this.dragging = true;
        return this.callParent(arguments);
    }

});
