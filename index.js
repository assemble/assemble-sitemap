'use strict';

var fs = require('fs');
var path = require('path');
var isValid = require('is-valid-app');
var through = require('through2');
var entry = require('./lib/entry');
var utils = require('./lib/utils');
var template = path.join(__dirname, 'templates/sitemap.hbs');

module.exports = function sitemap(options) {
  return function(app) {
    if (!isValid(app, 'assemble-sitemap')) return;

    app.postWrite(/\.xml$/, function(view, next) {
      view.extname = '.hbs';
      next();
    });

    // namespace the helpers to avoid conflict with custom helpers
    app.helper('sitemap_entry', entry);
    app.asyncHelper('sitemap_collection', require('helper-collection'));

    app.define('sitemap', function(name, options, fn) {
      if (name !== null && typeof name !== 'string') {
        options = name;
        name = null;
      }

      if (typeof options === 'function') {
        fn = options;
        options = {};
      }
      if (typeof options === 'string') {
        options = {dest: options};
      }

      var opts = utils.sitemapOptions(app, options);
      var tmpl = opts.template || template;
      var view = app.view({path: tmpl});

      let destBase;
      let files = [];

      app.on('dest', function(dest) {
        destBase = dest;
      });

      function rename(file) {
        var dest = utils.getProp(app, opts, 'dest');
        var cwd = utils.getProp(app, opts, 'cwd');

        file.basename = 'sitemap.xml';
        if (cwd) {
          file.cwd = path.resolve(cwd);
        }

        var base = destBase;
        if (typeof destBase === 'function') {
          base = destBase(file.clone());
        }

        if (dest && base) {
          file.base = base;
          if (base.indexOf(dest) !== 0) {
            file.dirname = path.resolve(file.base, dest);
          } else {
            file.dirname = file.base;
          }
          file.path = path.resolve(file.dirname, file.basename);
        } else if (base) {
          file.base = base;
          file.dirname = file.base;
          file.path = path.resolve(file.dirname, file.basename);
        } else {
          throw new Error('expected dest or destBase to be defined');
        }

        if (typeof fn === 'function') {
          fn(file);
        }
      }

      return through.obj(function(file, enc, next) {
        files.push(file);
        next(null, file);
      }, function(cb) {
        let data = app.data('sitemap');
        let self = this;

        if (typeof name === 'string') {
          data.collection = name;
        }

        if (typeof data.collection === 'undefined') {
          app.create('sitemap_files');
          app.sitemap_files(files);
          data.collection = 'sitemap_files';
        }


        app.render(view, {sitemap: data}, function(err, view) {
          if (err) {
            cb(err);
            return;
          }
          rename(view);
          self.push(view);
          cb();
        });
      });
    });
  };
};
