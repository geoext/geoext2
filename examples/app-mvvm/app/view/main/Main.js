/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 */
Ext.define('CF.view.main.Main', {
    extend: 'Ext.container.Container',
    requires: [
        'CF.view.main.MainModel',
        'CF.view.map.Map',
        'CF.view.summit.Grid',
        'CF.view.summit.Chart',
        'CF.view.header.Header'
    ],

    xtype: 'app-main',

    viewModel: {
        type: 'main'
    },

    layout: {
        type: 'border'
    },

    items: [
        {
            region: 'north',
            xtype: 'cf_header'
        },
        {
            region: 'west',
            width: 500,
            xtype: 'cf_mappanel'
        },
        {
            xtype: 'panel',
            region: 'center',
            border: false,
            id    : 'viewport',
            layout: {
                type: 'vbox',
                align: 'stretch'
            },
            items: [
                {xtype: 'cf_summitgrid'},
                {xtype: 'splitter'},
                {xtype: 'cf_summitchart'}
            ]
        }
    ]
});
