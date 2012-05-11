/**
 * The grid in which summits are displayed
 * @extends Ext.grid.Panel
 */
Ext.define('GX.view.summit.Grid' ,{
    extend: 'Ext.grid.Panel',
    alias : 'widget.summitgrid',
    requires: [
        'GeoExt.selection.FeatureModel',
        'GeoExt.grid.column.Symbolizer',
        'Ext.grid.plugin.CellEditing',
        'Ext.form.field.Number'
    ],
    initComponent: function() {
        Ext.apply(this, {
            border: true,
            columns: [
                {header: '', dataIndex: 'symbolizer', xtype: 'gx_symbolizercolumn', width: 30},
                {header: 'ID', dataIndex: 'fid', width: 40},
                {header: 'Name', dataIndex: 'name', flex: 3},
                {header: 'Elevation', dataIndex: 'elevation', width: 60,
                    editor: {xtype: 'numberfield'}
                },
                {header: 'Title', dataIndex: 'title', flex: 4},
                {header: 'Position', dataIndex: 'position', flex: 4}
            ],
            flex: 1,
            title : 'Summits Grid',
            store: 'Summits',
            selType: 'featuremodel',
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2
                })
            ]
        });
        this.getSelectionModel().autoPanMapOnSelection = true;
        this.callParent(arguments);
        // store singleton selection model instance
        GX.view.summit.Grid.selectionModel = this.getSelectionModel();
    }
});
