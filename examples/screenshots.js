var 
	system = require('system'),
	webpage = require('webpage'),
	baseUrl = encodeURI(system.args[1]),
	
	// provide a string or a config object
	examples = [
	    "action/mappanel_with_actions.html",
	    "app/simple/simple.html",
	    {
	     	url: "geocoder/geocoder.html",
	     	fn: function(){ 
	     		Ext.ComponentQuery.query("gx_geocodercombo")[0].doQuery('Bonn'); 
	     	},
	    	clipRect: { top: 184, left:28, width: 490, height: 390 }
	    },
	    "grid/feature-grid.html",
	    "layeropacityslider/layeropacityslider.html",
	    "legendpanel/legendpanel.html",
	    "mappanel/mappanel.html",
	    "permalink/permalink.html",
	    "popup/popup.html",
	    "printextent/print-extent.html",
	    "printform/print-form.html",
	    "printpage/print-page.html",
	    "printpreview/print-preview.html",
	    "renderer/renderer.html",
	    "stylegrid/style-grid.html",
	    "tree/tree-legend.html",
	    "wfscapabilities/wfscapabilities.html",
	    "wmscapabilities/wmscapabilities.html",
	    "zoomchooser/zoomchooser.html",
	    "zoomslider/zoomslider.html"
    ];
/**
 * Waits for ExtJS to be ready, then executes provided function
 *
 * @param fun function to execute
 */
var waitForExtReady = function(p, fun) {
    var me = this;
    console.log('Waiting for ExtJS to be ready...');
    var readyChecker = window.setInterval(function() {

        var isReady = p.evaluate(function() {
            return Ext && Ext.isReady;
        });

        if (isReady) {
            console.log('ExtJS is ready.');
            window.clearInterval(readyChecker);
            fun.call(me);
        }
    }, 2000);
};

var capture = function(exampleUrl, ii, cfg){
	
	var page = webpage.create(),
		pageUrl = baseUrl + exampleUrl,
		thumbUrl = exampleUrl.split("/").slice(0, exampleUrl.split("/").length - 1).join("/") + "/",
		image = 'thumb'+ii+'.png',
		f = 4; // factor for viewport size
	
	console.log("thumbUrl:",thumbUrl);
	
	page.viewportSize = { width: 118 * f, height : 90 * f };
	
	page.open(pageUrl, function(){
		
		waitForExtReady(page, function() {
			window.setTimeout(function(){
				
				// hide theme switcher
				page.evaluate( function(){ Ext.get("options-toolbar").hide(); });
				
				// call optional function
				if (cfg && cfg.fn) page.evaluate( cfg.fn );
				
				// clip optionally
				if (cfg && cfg.clipRect) page.clipRect = cfg.clipRect;
				
				// the actual snapshot 
				page.render( thumbUrl + image );
				
				// maybe end phantomjs
				if ( ii == examples.length - 1 ) 
	              window.setTimeout(phantom.exit, 2000); 
			}, 5000);
        });
		
	});
	
}

for (var i = 0; i < examples.length; i++) {
	
	var url = examples[i];
		
	
	if (url instanceof Object)
	{
		capture(url.url,i,{
			fn: url.fn || null,
			clipRect: url.clipRect || null
		});
	} 
	else 
	{ 
		capture(url,i);
	};
	
}
