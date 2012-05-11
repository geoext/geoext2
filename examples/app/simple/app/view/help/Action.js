/**
 * Help Action
 * @extends Ext.Action
 */
Ext.define('GX.view.help.Action', {
    extend: 'Ext.Action',
    alias : 'widget.gxapp_helpaction',
    requires: ['GX.view.help.Window'],

    /**
     * @property {String} windowContentEl
     * Sets the window contentEl property
     */
    /**
     * @cfg {Boolean} activateOnEnable
     *  Sets the window contentEl property
     */
    windowContentEl: null,

    /**
     * @private
     * @cfg {_window}
     *  The instance of the help window created.
     */
    _window: null,

    /**
     * @private
     *
     * Create a GX.view.help.Action instance.
     *
     * @param {Object} config (optional) Config object.
     *
     */
    constructor: function(config) {
        Ext.apply(config, {
            handler: function() {
                if (!this._window) {
                    this._window = Ext.create('GX.view.help.Window', {
                        contentEl: this.windowContentEl
                    });
                }
                this._window.show();
            },
            text: "Help"
        });
        this.callParent(arguments);
    }
});
