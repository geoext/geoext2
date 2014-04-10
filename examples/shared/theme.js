Ext.onReady(function() {
    var defaultTheme = 'neptune';
    function getQueryParam(name, queryString) {
        var match = RegExp(name + '=([^&]*)').exec(queryString || location.search);
        return match && decodeURIComponent(match[1]);
    }

    function addThemeCss(filename) {
        var fileref = document.createElement("link")
            fileref.setAttribute("rel", "stylesheet")
            fileref.setAttribute("type", "text/css")
            fileref.setAttribute("href", filename);
        if (typeof fileref != "undefined") {
            document.getElementsByTagName("head")[0].appendChild(fileref);
        }
    }

    var theme = getQueryParam('theme') || defaultTheme;
    var cssFiles = ['popup', 'tree'];
    for (var i=0, ii=cssFiles.length; i<ii; ++i) {
        addThemeCss('../../resources/css/' + cssFiles[i] + '-' + theme + '.css');
    }
});
