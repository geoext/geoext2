/**
 * The grid in which summits are displayed
 * @extends Ext.grid.Panel
 */
Ext.define('GX.view.summit.Grid' ,{
    extend: 'Ext.grid.Panel',
    alias : 'widget.summitgrid',
    initComponent: function() {
        Ext.apply(this, {
            border: true,
            columns: [
                {header: 'ID', dataIndex: 'id', width: 40},
                {header: 'Name', dataIndex: 'name', flex: 5},
                {header: 'Elevation', dataIndex: 'elevation', width: 60},
                {header: 'Latitude', dataIndex: 'lat', flex: 2},
                {header: 'Longitude', dataIndex: 'lon', flex: 2}
            ],
            flex: 1,
            title : 'Summits Grid',
            store: 'Summits'
        });
        this.callParent(arguments);
    }
});
