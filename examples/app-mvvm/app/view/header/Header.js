/**
 * The application header displayed at the top of the viewport
 */
Ext.define('CF.view.header.Header', {
    extend: 'Ext.panel.Panel',

    xtype: 'cf_header',

    requires: ['CF.view.header.HeaderModel'],

    viewModel: {
        type: 'header'
    },

    baseCls: 'cf-header',

    bind: {
        title: '{title}'
    }
});
