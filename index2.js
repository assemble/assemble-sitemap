'use strict';

var url = require('url');

function Index() {

}

Index.prototype.sitemap = function() {
  this.sitemaps.push(new Sitemap(sitemap));
  return this;
};

Index.prototype.generate = function() {
  // body...
};

function Sitemap(options) {
  this.options = extend({}, options);
  this.entries = [];
}

Sitemap.prototype.entry = function(entry) {
  this.entries.push(new Entry(entry));
  return this;
};

Sitemap.prototype.generate = function() {
  // body...
};

function Entry(file) {
  this.file = file;
  this.data = get(this.file, 'data.sitemap') || {};

  this.loc = file.relative;
  this.lastmod = file.data.sitemap;
  this.changefreq = file.data.sitemap;
  this.priority = file.data.sitemap;
}

Object.defineProperty(Entry.prototype, 'loc', {
  get: function() {
    return this.file.relative;
  }
});

Object.defineProperty(Entry.prototype, 'lastmod', {
  get: function() {
    return this.data.lastmod;
  }
});

function entry(file) {
  return function(site) {
    return {
      loc: url.resolve(site.href, file.relative),
      lastmod: lastmod(file, site),
      changefreq: changefreq(file, site),
      priority: priority(file, site)
    };
  };
}

function lastmod(file, site) {

}
function changefreq(file, site) {

}
function priority(file, site) {

}

