var 
	system = require('system'),
	webpage = require('webpage'),
	baseUrl = encodeURI(system.args[1]),
	examples = [
	    "action/mappanel_with_actions.html",
	    "app/simple/simple.html",
	    {
	     	url: "geocoder/geocoder.html",
	     	fn: function(){ 
	     		Ext.ComponentQuery.query("gx_geocodercombo")[0].doQuery('Bonn'); 
	     	},
	    	clipRect: { top: 0, left:0, width: 400, height: 400 }
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
var capture = function(example, ii){
	
	var exampleUrl = (exampleUrl instanceof Object) ? example.url : example;
	
	var page = webpage.create(),
		pageUrl = baseUrl + exampleUrl,
		image = 'thumb_test_'+ ii +'.png';
	
	page.viewportSize = { width: 118*4, height : 90*4 };
	
	page.open(pageUrl, function(){
		
		waitForExtReady(page, function() {
			window.setTimeout(function(){
				page.evaluate( function(){ Ext.get("options-toolbar").hide(); });
				if (example.fn) page.evaluate( fn );
				if (example.clipRect) page.clipRect = example.clipRect;
				page.render( image ); 
				if ( ii == examples.length - 1 ) 
	              window.setTimeout(phantom.exit, 2000); 
			}, 5000);
        });
		
	});
	
}

for (var i = 0; i < examples.length; i++) {
	var url = examples[i];
	console.log("capturing page " + i + ": ", url);
	capture(url,i);
}
