/*
 * Copyright (c) 2008-2014 The Open Source Geospatial Foundation
 *
 * Published under the BSD license.
 * See https://github.com/geoext/geoext2/blob/master/license.txt for the full
 * text of the license.
 */
(function() {
    var major = 2,
        minor = 0,
        patch = 3,
        label = 'dev',
        environment = [],
        extVersions = Ext.versions.extjs,
        isExt5 = false,
        isExt4 = false,
        v = '';


    // Concatenate GeoExt version.
    v = 'v' + major + '.' + minor + '.' + patch + (label ? '.' + label : '');

    // Grab versions of libraries in the environment
    if ( extVersions ) {
        environment.push('ExtJS: ' + extVersions.version);
        isExt4 = extVersions.major === 4;
        isExt5 = extVersions.major === 5;
    }
    if ( window.OpenLayers ) {
        environment.push('OpenLayers: ' + OpenLayers.VERSION_NUMBER);
    }
    environment.push('GeoExt: ' + v);

    /**
     * A singleton class holding the properties #version with the current
     * GeoExt version and #environment with a string about the surrounding
     * libraries ExtJS and OpenLayers.
     */
    Ext.define('GeoExt.Version', {
        singleton: true,

        /**
         * The version number of GeoExt.
         *
         * @property {String} version
         */
        version: v,

        /**
         * Lists the versions of the currently loaded libraries and contains the
         * versions of `ExtJS`, `OpenLayers` and `GeoExt`.
         *
         * @property {String} environment
         */
        environment: (environment.join(', ')),

        /**
         * Whether we are running in an ExtJS 4 environment or not.
         *
         * @property {Boolean} Whether we are running in an ExtJS 4 environment
         *     or not.
         */
        isExt4: isExt4,

        /**
         * Whether we are running in an ExtJS 5 environment or not.
         *
         * @property {Boolean} Whether we are running in an ExtJS 5 environment
         *     or not.
         */
        isExt5: isExt5

    }, function() {
        /**
         * The GeoExt root object.
         *
         * @class GeoExt
         * @singleton
         */
        /**
         * @inheritdoc GeoExt.Version#version
         * @member GeoExt
         * @property version
         */
        GeoExt.version = GeoExt.Version.version;

        /**
         * @inheritdoc GeoExt.Version#isExt4
         * @member GeoExt
         * @property isExt4
         */
        GeoExt.isExt4 = GeoExt.Version.isExt4;

        /**
         * @inheritdoc GeoExt.Version#isExt5
         * @member GeoExt
         * @property isExt5
         */
        GeoExt.isExt5 = GeoExt.Version.isExt5;
    });
})();
