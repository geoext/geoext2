/**
 * Copyright (c) 2008-2011 The Open Source Geospatial Foundation
 * 
 * Published under the BSD license.
 * See http://svn.geoext.org/core/trunk/geoext/license.txt for the full text
 * of the license.
 */


/** api: example[wms-capabilities]
 *  WMS Capabilities Store
 *  ----------------------
 *  Create layer records from WMS capabilities documents.
 */

var store;

Ext.require([
    'GeoExt.data.reader.CswRecords',
    'GeoExt.data.CswRecordsModel',
    'GeoExt.data.proxy.Protocol'
]);

Ext.application({
    name: 'WMSGetCapabilities',
    launch: function() {

        var filter = new OpenLayers.Filter.Comparison({
            type: OpenLayers.Filter.Comparison.LIKE,
            matchCase: false,
            property: 'csw:AnyText',
            value: '*USA*'
        });
        
        // create a new WMS capabilities store
        store = Ext.create('Ext.data.Store', {
            model: 'GeoExt.data.CswRecordsModel',
            proxy: Ext.create("GeoExt.data.proxy.Protocol", {
                setParamsAsOptions: true,
                protocol: new OpenLayers.Protocol.CSW({
                    url: "http://localhost/csw"
                }),
                reader: Ext.create("GeoExt.data.reader.CswRecords")
            })
        });

        var data = {
            "resultType": "results",
            "maxRecords": 5,
            "Query": {
                "typeNames": "gmd:MD_Metadata",
                "ElementSetName": {
                    "value": "full"
                }
            }
        };

        Ext.apply(data.Query, {
            "Constraint": {
                version: "1.1.0",
                Filter: filter
            }
        });

        // use baseParams so paging takes them into account
        store.proxy.extraParams = data;
        store.load();

        Ext.create("Ext.grid.Panel", {
            border: false,
            bbar: new Ext.PagingToolbar({
                paramNames: {
                    start: 'startPosition',
                    limit: 'maxRecords'
                },
                store: store,
                pageSize: 5
            }),
            renderTo: 'grid',
            store: store,
            columns: [{
                id: 'title',
                xtype: "templatecolumn",
                flex: 1,
                tpl: new Ext.XTemplate('<b>{title}</b><br/>{abstract}'),
                sortable: true
            }],
            autoExpandColumn: 'title',
            width: 400,
            height: 300
        });
    }
});
