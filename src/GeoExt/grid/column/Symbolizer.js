/*
 * Copyright (c) 2008-2012 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full text
 * of the license.
 */

/**
 * @class GeoExt.grid.column.Symbolizer
 *
 * An {@link Ext.grid.column.Column} pre-configured with a 
 * {@link GeoExt.FeatureRenderer}
 */
Ext.define('GeoExt.grid.column.Symbolizer', {
    extend: 'Ext.grid.column.Column',
    alternateClassName: 'GeoExt.grid.SymbolizerColumn',
    alias: ['widget.gx_symbolizercolumn'],
    require: ['GeoExt.FeatureRenderer'],

    defaultRenderer: function(value, meta, record) {
        if (value) {
            var id = Ext.id();
            window.setTimeout(function() {
                var renderer = Ext.create('GeoExt.FeatureRenderer', {
                    renderTo: id,
                    symbolizers: value instanceof Array ? value : [value]
                });
            }, 0);
            meta.css = "gx-grid-symbolizercol";
            return Ext.String.format('<div id="{0}"></div>', id);
        }
    }
});
