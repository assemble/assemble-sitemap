'use strict';

var extend = require('extend-shallow');
var moment = require('moment');

exports.lastModified = function(data, item) {
  var date = data.lastModified || data.lastmod || item.stat && item.stat.mtime;
  return moment(date || new Date()).format('YYYY-MM-DD');
};

// ensure this works with or without assemble
exports.sitemapOptions = function(app, options) {
  app.options = app.options || {};
  app.cache = app.cache || {data: {}};
  var appOpts = app.options.sitemap;
  var appData = app.cache.data.sitemap;
  return extend({}, app.options, appOpts, appData, options);
};

// ensure this works with or without assemble
exports.getProp = function(app, options, prop) {
  var cache = app.cache || {data: {}};
  return options[prop] || cache[prop] || app.options[prop] || cache.data[prop];
};
