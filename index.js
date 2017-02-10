'use strict';

var path = require('path');
var url = require('url');
var toRange = require('to-regex-range');
var through = require('through2');
var merge = require('mixin-deep');
var toHtml = require('html-tag');

module.exports = function sitemap(options) {
  return function(app) {
    if (!app.isApp) return;
    var template = path.join(__dirname, 'templates/sitemap.hbs');

    app.create('sitemapTemplates');
    app.sitemapTemplate(template);

    // namespace the helpers to avoid conflict with custom helpers
    app.asyncHelper('sitemap_entry', entry);
    app.asyncHelper('sitemap_collection', require('helper-collection'));
    app.asyncHelper('sitemap_default', function(value, defaultValue, options, cb) {
      cb(null, value == null ? defaultValue : value);
    });

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

      var appOpts = app.option('sitemap');
      var appData = app.data('sitemap');

      var opts = merge({template: template}, appOpts, appData, options);
      var view = app.sitemapTemplate(opts.template);
      console.log(view.cwd)
      console.log(view.base)
      console.log(view.dirname)
      console.log(view.path)
      console.log(view.relative)


      function rename(file) {
        var dest = opts.dest || app.get('cache.dest') || app.option('dest') || app.data('dest');
        var cwd = opts.cwd || app.get('cache.cwd') || app.option('cwd') || app.data('cwd');

        file.basename = 'sitemap.xml';

        if (typeof fn === 'function') {
          fn(file);
        } else {
          if (cwd) {
            file.cwd = cwd;
          }
          if (dest) {
            file.base = dest;
          }
        }

        console.log(file.cwd)
        console.log(file.base)
        console.log(file.dirname)
        console.log(file.path)
        console.log(file.relative)
      }

      return through.obj(function(file, enc, next) {
        next(null, file);
      }, function(cb) {
        var data = app.data('sitemap') || {};
        var self = this;

        if (typeof name === 'string') {
          data.collection = name;
        }

        if (typeof data.collection === 'undefined') {
          data.collection = 'pages';
        }

        app.render(view, {sitemap: data}, function(err, view) {
          if (err) {
            cb(err);
            return;
          }
          rename(view);
          // self.push(view);
          cb();
        });
      });
    });
  };
};

function entry(item, tag, options, cb) {
  var data = item.data.sitemap || {};
  var opts = merge({}, this.options, this.options.sitemap, this.context.sitemap, data);
  var dest = opts.dest || this.app.get('cache.dest') || this.app.options.dest;
  var val = null;

  switch (tag) {
    case 'loc':
      var rel = item.relative;
      if (dest && item.data.dest) {
        rel = path.join(path.relative(dest, item.data.dest), rel);
      }

      val = url.resolve(opts.url, rel);
      break;
    case 'lastmod':
      val = lastModified(data, item);

      if (!val) {
        cb(new Error('no lastmod datestamp found for: ' + item.path));
        return;
      }

      break;
    case 'changefreq':
    case 'priority':
      val = opts[tag];
      break;
    default: {
      cb(new Error('unrecognized tag: ' + tag));
      return;
    }
  }
  cb(null, toHtml(tag, val));
}

function lastModified(data, item) {
  var date = data.lastModified ||  data.lastmod || item.stat && item.stat.mtime;
  if (typeof date === 'undefined') {
    date = new Date();
  }
  if (date && typeof date === 'string' && !/^\d{4}-\d{2}-\d{2}/.test(date)) {
    date = new Date(date);
  }
  return date.toISOString().slice(0, 10);
}
