/**
 * Loads the resources of ExtJS and OpenLayers.
 *
 * Use the URL-parameter `extjs` to require a specific
 * version of Ext, e.g. `Action.html?extjs=5.0.1`
 */
(function(win, doc){
    var // OpenLayers from the official website
        olUrl = 'http://openlayers.org/api/2.13.1/OpenLayers.js',
        // Grab version from URL-parameter
        extjs = win.location.href.match(/extjs=([0-9\.]+)\&?/i),
        // ...fallback to 4.2.1
        v = extjs ? extjs[1] : '4.2.1',
        // Use officialSencha CDN
        urlExt4 = 'http://cdn.sencha.com/ext/gpl/',
        scriptPrefix = '<script type="text/javascript" charset="utf-8" src="',
        scriptSuffix = '"><\/script>',
        linkPrefix = '<link rel="stylesheet" type="text/css" href="',
        // TODO we need to load this from a local resource, due to CORS
        urlExt5,
        // TODO only needed to determine the path to a local ExtJS 5
        indexOfTestsDir;

    if (v.indexOf('4') === 0) {
        // The version starts with 4, let's include both the CSS and the JS.
        doc.writeln(
            linkPrefix + urlExt4 + v + '/resources/css/ext-all.css" />'
        );
        doc.writeln(
            scriptPrefix + urlExt4 + v + '/ext-all-debug.js' + scriptSuffix
        );
    } else {
        // we shall load ExtJS, let the example loader take care of the details.
        indexOfTestsDir = win.location.href.lastIndexOf('/tests/');
        urlExt5 = win.location.href.substr(0, indexOfTestsDir) + '/../';
        doc.write(
            scriptPrefix + urlExt5 + 'ext-' + v + '/examples/shared/include-ext.js' +
            scriptSuffix
        );
        // The version below includes Ext from their CDN, but is currently
        // blocked due to SOP / CORS not being enabled
        //
        // doc.write('<script type="text/javascript" charset="utf-8" src="' +
        //         urlExt4 + v + '/examples/shared/include-ext.js" >' +
        //         '<\/script>');
        //
        // => XMLHttpRequest cannot load
        // http://cdn.sencha.com/ext/gpl/5.0.0/bootstrap-manifest.js. No
        // 'Access-Control-Allow-Origin' header is present on the requested
        // resource. Origin 'http://localhost' is therefore not allowed access.
        //
        // https://twitter.com/selectoid/status/478786416856813569
    }

    // OpenLayers
    doc.write(scriptPrefix + olUrl + scriptSuffix);
})(window, document);