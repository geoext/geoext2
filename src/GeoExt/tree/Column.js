/**
 * Provides indentation and folder structure markup for a Tree taking into account
 * depth and position within the tree hierarchy.
 * 
 * @private
 */
Ext.define('GeoExt.tree.Column', {
    extend: 'Ext.tree.Column',
    alias: 'widget.gx_treecolumn',

    /**
     * @cfg {String} text
     * The header text to be used as innerHTML (html tags are accepted) to display in the Grid.
     * **Note**: to have a clickable header with no text displayed you can use the default of `&#160;` aka `&nbsp;`.
     */
    text     : 'Name',

    width    : Ext.isIE6 ? null : 10000,

    /**
     * @cfg {String} dataIndex
     * The name of the field in the grid's {@link Ext.data.Store}'s {@link Ext.data.Model} definition from
     * which to draw the column's value. **Required.**
     */
    dataIndex: 'text',

    initComponent: function() {
        var me = this;

        me.callParent();

        var parentRenderer = this.renderer;

        this.renderer = function(value, metaData, record, rowIdx, colIdx, store, view) {

            var buf   = [parentRenderer(value, metaData, record, rowIdx, colIdx, store, view)];

            // Replace all base layers from checkbox to radio
            if(record.get('checkedGroup')) {
                buf[0] = buf[0].replace(/class="([^-]+)-tree-checkbox([^"]+)?"/, 'class="$1-tree-checkbox$2 gx-tree-radio"'); //"
            }

            if(record.uiProvider && record.uiProvider instanceof 'string') {
                
            }

            return buf.join('');
        };

    },

    defaultRenderer: function(value) {
        return value;
    }
});
