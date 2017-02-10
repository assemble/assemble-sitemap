'use strict';

var extend = require('extend-shallow');
var moment = require('moment');

exports.lastModified = function(data, item) {
  var date = data.lastModified || data.lastmod || item.stat && item.stat.mtime;
  return moment(date).format('YYYY-MM-DD');
};

exports.sitemapOptions = function(app, options) {
  var appOpts = app.option('sitemap');
  var appData = app.data('sitemap');
  return extend({}, app.options, appOpts, appData, options);
};

exports.getProp = function(app, options, prop) {
  return options[prop]
    || app.get(['cache', prop])
    || app.option(prop)
    || app.data(prop);
};
