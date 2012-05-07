Ext.define('GeoExt.legend.Image', {
    extend : 'Ext.Component',
    requires : [
    //    'GeoExt.data.LayerStore'
    ],
    alias : 'widget.gx_legendimage',
    alternateClassName : 'GeoExt.LegendImage',
    
    statics : {
        guess : function() {
            var candidates = Ext.ComponentQuery.query("gx_layerlegend");
            return ((candidates && candidates.length > 0) 
                ? candidates[0] 
                : null);
        }
    },
    
    /** api: config[url]
     *  ``String``  The url of the image to load
     */
    url: null,
    
    /** api: config[defaultImgSrc]
     *  ``String`` Path to image that will be used if the legend image fails
     *  to load.  Default is Ext.BLANK_IMAGE_URL.
     */
    defaultImgSrc: null,

    /** api: config[imgCls]
     *  ``String``  Optional css class to apply to img tag
     */
    imgCls: null,
    
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
    
    /** api: method[setUrl]
     *  :param url: ``String`` The new URL.
     *  
     *  Sets the url of the legend image.
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

    /** private: method[onRender]
     *  Private method called when the legend image component is being
     *  rendered.
     */
    onRender: function(ct, position) {
        this.callParent(arguments);
        if(this.url) {
            this.setUrl(this.url);
        }
    },

    /** private: method[onDestroy]
     *  Private method called during the destroy sequence.
     */
    onDestroy: function() {
        var el = this.getEl();
        if(el) {
            el.un("error", this.onImageLoadError, this);
        }
        this.callParent(arguments);
    },
    
    /** private: method[onImageLoadError]
     *  Private method called if the legend image fails loading.
     */
    onImageLoadError: function() {
        this.getEl().dom.src = this.defaultImgSrc;
    }
},function () {
//    console.log(arguments);
});