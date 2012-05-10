/**
 * The store used for summits
 */
Ext.define('GX.store.Summits', {
    extend: 'Ext.data.Store',
    model: 'GX.model.Summit',
    autoLoad: true,
    proxy: {
        reader: {
            type: 'json',
            root: 'summits',
            successProperty: 'success'
        },
        type: 'ajax',
        url : 'resources/json/summits.json'
    }
});
