Ext.define('GeoExt.data.WmsCapabilitiesLayerModel',{
    extend: 'GeoExt.data.LayerModel',
    require: ['GeoExt.data.reader.WmsCapabilitiesReader'],
    alternateClassName: ['GeoExt.data.WMSCapabilitiesModel','GeoExt.data.WmsCapabilitiesModel'],
    alias: 'model.gx_wmscapabilities',
    fields: [
        {name: "name", type: "string", mapping: "metadata.name"},
        {name: "title", type: "string", mapping: "metadata.title"},
        {name: "abstract", type: "string", mapping: "metadata.abstract"},
        {name: "queryable", type: "boolean", mapping: "metadata.queryable"},
        {name: "opaque", type: "boolean", mapping: "metadata.opaque"},
        {name: "noSubsets", type: "boolean", mapping: "metadata.noSubsets"},
        {name: "cascaded", type: "int", mapping: "metadata.casacaded"},
        {name: "fixedWidth", type: "int", mapping: "metadata.fixedWidth"},
        {name: "fixedHeight", type: "int", mapping: "metadata.fixedHeight"},
        {name: "minScale", type: "float", mapping: "metadata.minScale"},
        {name: "maxScale", type: "float", mapping: "metadata.maxScale"},
        {name: "prefix", type: "string", mapping: "metadata.prefix"},
        {name: "attribution", type: "string"},
        {name: "formats", mapping: "metadata.formats"}, // array
        {name: "styles", mapping: "metadata.styles"}, // array
        {name: "srs", mapping: "metadata.srs"}, // object
        {name: "dimensions", mapping: "metadata.dimensions"}, // object
        {name: "bbox", mapping: "metadata.bbox"}, // object
        {name: "llbbox", mapping: "metadata.llbox"}, // array
        {name: "keywords", mapping: "metadata.keywords"}, // array
        {name: "identifiers", mapping: "metadata.identifiers"}, // object
        {name: "authorityURLs", mapping: "metadata.authorityURLs"}, // object
        {name: "metadataURLs", mapping: "metadata.metadataURLs"} // array    
    ],
    proxy: {
        type: 'ajax',
        reader: {
            type: 'gx_wmscapabilites'
        }
    }
});