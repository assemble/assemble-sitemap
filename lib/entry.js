'use strict';

var url = require('url');
var path = require('path');
var extend = require('extend-shallow');
var toHtml = require('html-tag');
var utils = require('./utils');

module.exports = function(item, tag, options) {
  try {
    let data = extend({}, item.data, item.data.sitemap);
    let opts = extend({}, utils.sitemapOptions(this.app));
    let dest = utils.getProp(this.app, opts, 'dest');
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
        val = utils.lastModified(ctx, item);
        break;

      case 'changefreq':
        val = ctx[tag] || 'weekly';
        break;

      case 'priority':
        val = ctx[tag] || '0.5';
        break;

      default: {
        throw new Error('unrecognized tag: ' + tag);
      }
    }

    return toHtml(tag, val);
  } catch (err) {
    throw err;
  }
};
