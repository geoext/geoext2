/**
 * The main application class. An instance of this class is created by app.js when it calls
 * Ext.application(). This is the ideal place to handle application launch and initialization
 * details.
 */
Ext.define('CF.Application', {
    extend: 'Ext.app.Application',
    
    name: 'CF',
    
    requires: [
        'CF.view.summit.Grid',
        'CF.view.summit.Chart'
    ],

    stores: [
        // TODO: add global / shared stores here
    ],
    
    launch: function () {
        // TODO - Launch the application
    }
});
