'use strict';

var fs = require('fs');
var url = require('url');
var path = require('path');
var moment = require('moment');
var isValid = require('is-valid-app');
var extend = require('extend-shallow');
var through = require('through2');
var toHtml = require('html-tag');
var template = path.join(__dirname, 'templates/sitemap.hbs');

module.exports = function sitemap(options) {
  return function(app) {
    if (!isValid(app, 'assemble-sitemap')) return;

    app.postWrite(/\.xml$/, function(view, next) {
      view.extname = '.hbs';
      next();
    });

    // namespace the helpers to avoid conflict with custom helpers
    app.asyncHelper('sitemap_entry', entry);
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

      var opts = sitemapOptions(app, options);
      var tmpl = opts.template || template;
      var view = app.view({path: tmpl});
      view.contents = fs.readFileSync(tmpl);

      let destBase;
      let files = [];

      app.on('dest', function(dest) {
        destBase = dest;
      });

      function rename(file) {
        var dest = get(app, opts, 'dest');
        var cwd = get(app, opts, 'cwd');

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

function entry(item, tag, options, cb) {
  let data = extend({}, item.data, item.data.sitemap);
  let opts = extend({}, sitemapOptions(this.app));
  let dest = get(this.app, opts, 'dest');
  let val = null;

  let ctx = extend({}, opts, this.context, data);

  switch (tag) {
    case 'loc':
      let rel = item.relative;
      if (dest && ctx.dest) {
        rel = path.join(path.relative(dest, ctx.dest), rel);
      }

      val = url.resolve(ctx.url, rel);
      break;

    case 'lastmod':
      val = lastModified(ctx, item);
      break;

    case 'changefreq':
      val = ctx[tag] || 'weekly';
      break;

    case 'priority':
      val = ctx[tag] || '0.5';
      break;

    default: {
      cb(new Error('unrecognized tag: ' + tag));
      return;
    }
  }
  cb(null, toHtml(tag, val));
}

function lastModified(data, item) {
  var date = data.lastModified || data.lastmod || item.stat && item.stat.mtime;
  return moment(date).format('YYYY-MM-DD');
}

function sitemapOptions(app, options) {
  var appOpts = app.option('sitemap');
  var appData = app.data('sitemap');
  return extend({}, app.options, appOpts, appData, options);
}

function get(app, options, prop) {
  return options[prop]
    || app.get(['cache', prop])
    || app.option(prop)
    || app.data(prop);
}
