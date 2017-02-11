'use strict';

var path = require('path');
var del = require('delete');
var collection = require('helper-collection');
var entry = require('../lib/entry');
var assemble = require('assemble');
var app = module.exports = assemble();

/**
 * Build variables
 */

var dest = path.join.bind(path, __dirname, 'dist');
var cwd = path.join.bind(path, __dirname, '..');

/**
 * Custom template collection
 */

app.create('posts');

/**
 * Global data
 */

app.data({
  sitemap: {
    url: 'https://assemble.io',
    changefreq: 'daily',
    priority: '0.8'
  }
});

/**
 * Middleware
 */

app.helper('entry', entry);
app.helper('collection', collection);

/**
 * Middleware
 */

app.onLoad(/\.hbs$/, function(file, next) {
  file.dirname += '/' + path.basename(file.base);
  file.extname = '.html';
  next();
});

/**
 * Load templates
 */

app.posts('test/fixtures/posts/*.hbs');
app.pages('test/fixtures/docs/*.hbs');

/**
 * Tasks
 */

app.task('html', function(cb) {
  return app.toStream('posts') //<= push posts collection into stream
    .pipe(app.toStream('pages')) //<= push pages collection into stream
    .pipe(app.renderFile())
    .pipe(app.dest(dest()));
});

app.task('sitemap', function() {
  return app.src('templates/entries.hbs', {cwd: cwd()})
    .pipe(app.renderFile({collections: ['pages', 'posts']}))
    .pipe(app.dest(function(file) {
      file.basename = 'sitemap.xml';
      file.dirname = path.dirname(file.dirname);
      return dest();
    }));
});

app.task('delete', function(cb) {
  del(dest(), cb);
});

/**
 * Build
 *   $ node examples/helper.js
 */

app.build(['delete', 'html', 'sitemap'], function(err) {
  if (err) return console.log(err);
  console.log('done');
});
