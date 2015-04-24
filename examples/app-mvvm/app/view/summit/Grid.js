/**
 * The grid in which summits are displayed
 * @extends Ext.grid.Panel
 */
Ext.define('CF.view.summit.Grid' ,{
    extend: 'Ext.grid.Panel',
    xtype : 'cf_summitgrid',
    requires: [
        'Ext.form.field.Number',
        'GeoExt.selection.FeatureModel',
        'GeoExt.grid.column.Symbolizer',
        'CF.store.Summits'
    ],

    initComponent: function() {

        Ext.apply(this, {
            border: false,
            columns: [
                {
                    header: '',
                    dataIndex: 'symbolizer',
                    menuDisabled: true,
                    sortable: false,
                    xtype: 'gx_symbolizercolumn',
                    width: 30
                },
                {header: 'ID', dataIndex: 'fid', width: 40},
                {header: 'Name', dataIndex: 'name', flex: 3},
                {
                    header: 'Elevation',
                    dataIndex: 'elevation',
                    width: 60,
                    editor: {xtype: 'numberfield'}
                },
                {header: 'Title', dataIndex: 'title', flex: 4},
                {header: 'Latitude', dataIndex: 'lat', flex: 2},
                {header: 'Longitude', dataIndex: 'lon', flex: 2}
            ],
            flex: 1,
            store: Ext.create('CF.store.Summits', {storeId: 'summitStore'}),
            selType: 'featuremodel'
        });

        this.callParent();
    }
});
