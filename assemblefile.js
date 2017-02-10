'use strict';

var path = require('path');
var del = require('delete');
var assemble = require('assemble');
var sitemap = require('./');

var app = module.exports = assemble();
var dest = path.join.bind(path, __dirname, 'dist');

app.onLoad(/\.md$/, function(file, next) {
  file.extname = '.html';
  next();
});

app.option('dest', dest());
app.create('posts');
app.data('sitemap', {
  url: 'https://assemble.io',
  collection: 'pages',
  changefreq: 'daily',
  priority: '0.8'
});

app.use(sitemap());

app.task('default', function(cb) {
  del.sync('dist');
  return app.toStream('pages')
    .pipe(app.toStream('posts'))
    .pipe(app.renderFile())
    // .pipe(app.sitemap('posts', 'blog'))
    // .pipe(app.sitemap('pages', 'docs'))
    .pipe(app.sitemap(null, 'docs'))
    // .pipe(app.sitemap('posts', function(file) {
    //   file.dirname = dest('blog');
    //   file.base = dest();
    // }))
    // .pipe(app.sitemap('pages', function(file) {
    //   file.dirname = dest('docs');
    //   file.base = dest();
    // }))
    .pipe(app.dest(app.options.dest));
});
