'use strict';

var path = require('path');
var dest = path.join.bind(path, __dirname, 'dist');
var del = require('delete');
var assemble = require('assemble');
var sitemap = require('..');

var app = module.exports = assemble();
app.use(sitemap());

app.onLoad(/\.hbs$/, function(file, next) {
  file.extname = '.html';
  next();
});

// custom collection
app.create('posts');
app.posts('test/fixtures/posts/*.hbs');

app.data('sitemap', {
  url: 'https://assemble.io',
  changefreq: 'daily',
  priority: '0.8'
});

app.task('default', function(cb) {
  return app.toStream('posts')
    .pipe(app.renderFile())
    .pipe(app.sitemap())
    .pipe(app.dest(dest()));
});

app.task('delete', function(cb) {
  del(dest(), cb);
});
