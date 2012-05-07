Ext.define('GeoExt.legend.Image', {
    extend : 'Ext.Component',
    alias : 'widget.gx_legendimage',
    alternateClassName : 'GeoExt.LegendImage',

    config: {
        /**
         * @cfg {String} url
         * The url of the image to load
         */
        url: null,

        /**
         * @cfg {String} defaultImgSrc
         * Path to image that will be used if the legend image fails
         * to load.  Default is Ext.BLANK_IMAGE_URL.
         */
        defaultImgSrc: null,

        /**
         * @cfg {String} imgCls
         * Optional css class to apply to img tag
         */
        imgCls: null
    },

    initComponent: function(){
        var me = this;
        me.callParent(arguments);
        if(this.defaultImgSrc === null) {
            this.defaultImgSrc = Ext.BLANK_IMAGE_URL;
        }
        this.autoEl = {
            tag: "img",
            "class": (this.imgCls ? this.imgCls : ""),
            src: this.defaultImgSrc
        };
    },
    
    /**
     * Sets the url of the legend image.
     * @param {String} url The new URL.
     */
    setUrl: function(url) {
        this.url = url;
        var el = this.getEl();
        if (el) {
            el.un("error", this.onImageLoadError, this);
            el.on("error", this.onImageLoadError, this, {
                single: true
            });
            el.dom.src = url;
        }
    },

    /** 
     * Private method called when the legend image component is being
     * rendered.
     * @private
     */
    onRender: function(ct, position) {
        this.callParent(arguments);
        if(this.url) {
            this.setUrl(this.url);
        }
    },

    /** 
     * Private method called during the destroy sequence.
     * @private
     */
    onDestroy: function() {
        var el = this.getEl();
        if(el) {
            el.un("error", this.onImageLoadError, this);
        }
        this.callParent();
    },
    
    /**
     * Private method called if the legend image fails loading.
     * @private
     */
    onImageLoadError: function() {
        this.getEl().dom.src = this.defaultImgSrc;
    }
});
