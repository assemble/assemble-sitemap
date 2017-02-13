'use strict';

var path = require('path');
var through = require('through2');
var isValid = require('is-valid-app');
var sitemap = require('handlebars-helper-sitemap');
var assign = require('assign-deep');

module.exports = function(options) {
  return function(app) {
    if (!isValid(app, 'assemble-sitemap')) return;
    var sitemapDest;
    var files = [];

    // register sitemap handlebars helpers
    app.helpers(sitemap.helpers);

    /**
     * Generate a sitemap for the given collection or collections.
     *
     * @param {[type]} collection
     * @param {String} options) {      var dest
     * @return {[type]}
     * @api public
     */

    app.define('sitemap', function(collection, options) {
      var dest = '';
      var data = {};

      if (Array.isArray(collection)) {
        data.collections = collection;
        collection = null;
      }

      if (typeof collection !== 'string') {
        options = collection;
        collection = null;
      }

      if (typeof options === 'string' || typeof options === 'function') {
        dest = options;
        options = {};
      }

      options = options || {};
      collection = collection || options.collection;
      dest = dest || options.dest;

      if (options.collections) {
        data.collections = options.collections;
      }

      var view = app.view('sitemap.xml', {
        data: data,
        contents: options.template || sitemap.template,
        engine: 'hbs'
      });

      return through.obj(function(file, enc, next) {
        if (file.isNull()) {
          next(null, file);
          return;
        }

        if (file.basename === 'sitemap.xml') {
          next(null, file);
          return;
        }

        files.push(file);
        next(null, file);
      }, function(cb) {
        let data = assign({}, app.cache.data, app.data('sitemap'));
        var file = files[0];

        if (typeof collection === 'undefined') {
          collection = data.collection || file.options.collection;
        }

        view.data.collection = collection;
        view.base = file.base;
        view.cwd = file.cwd;
        view.dirname = file.dirname;

        if (typeof dest === 'function') {
          dest(view);
        } else if (dest) {
          view.dirname = path.join(file.dirname, dest);
        }

        this.push(view);
        cb();
      });
    });
  };
};

function arrayify(val) {
  return val ? (Array.isArray(val) ? val : [val]) : [];
}
