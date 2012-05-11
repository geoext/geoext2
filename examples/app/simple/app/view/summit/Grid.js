/**
 * The grid in which summits are displayed
 * @extends Ext.grid.Panel
 */
Ext.define('GX.view.summit.Grid' ,{
    extend: 'Ext.grid.Panel',
    alias : 'widget.summitgrid',
    requires: ['GeoExt.selection.FeatureModel'],
    initComponent: function() {
        Ext.apply(this, {
            border: true,
            columns: [
                {header: 'ID', dataIndex: 'fid', width: 40},
                {header: 'Name', dataIndex: 'name', flex: 3},
                {header: 'Elevation', dataIndex: 'elevation', width: 60},
                {header: 'Title', dataIndex: 'title', flex: 4},
                {header: 'Position', dataIndex: 'position', flex: 4}
            ],
            flex: 1,
            title : 'Summits Grid',
            store: 'Summits',
            selType: 'featuremodel'
        });
        this.callParent(arguments);
    }
});
