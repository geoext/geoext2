/**
 * View for chart showing summit heights
 */
Ext.define('CF.view.summit.Chart', {
    extend: 'Ext.panel.Panel',
    requires: [
        'Ext.chart.CartesianChart',
        'Ext.chart.axis.Numeric',
        'Ext.chart.axis.Category',
        'Ext.chart.series.Line',
        'Ext.chart.interactions.ItemHighlight'
    ],

    xtype : 'cf_summitchart',

    height: 500,

    layout: 'fit',

    // i18n properties
    bottomAxeTitleText: "Summit",
    leftAxeTitleText: "Elevation",

    initComponent: function() {

        var summitStore =  Ext.data.StoreManager.lookup('summitStore');
        var chart = Ext.create('Ext.chart.CartesianChart', {
            store: summitStore,
            legend: {
                docked: 'right'
            },
            axes: [
               {
                type: 'numeric',
                fields: ['elevation'],
                position: 'left',
                title: this.leftAxeTitleText,
                grid: true
            }, {
                type: 'category',
                fields: 'name',
                position: 'bottom',
                title: this.bottomAxeTitleText,
                grid: false
            }
            ],
            series: [{
                type: 'line',
                axis: 'left',
                title: [
                    this.leftAxeTitleText
                ],
                xField: 'name',
                yField: 'elevation',
                smooth: true,
                style: {
                    lineWidth: 3
                },
                marker: {
                    type: 'circle'
                },
                highlightCfg: {
                    scaling: 2
                },
                tooltip: {
                    trackMouse: true,
                    width: 130,
                    height: 40,
                    renderer: function(storeItem, item) {
                        this.setTitle(
                            storeItem.get('name') +
                            '<br />' +
                            storeItem.get('elevation') + ' meters'
                        );
                    }
                }
            }]
        });

        this.items = [chart];

        this.callParent();
    }
});
