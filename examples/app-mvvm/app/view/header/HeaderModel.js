/**
 * This class is the view model for the Header view of the application.
 */
Ext.define('CF.view.header.HeaderModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.header',

    data: {
        title: 'ExtJS 5 MVVM simple application example called CF ' +
        '(Cartography Framework)'
    }
});