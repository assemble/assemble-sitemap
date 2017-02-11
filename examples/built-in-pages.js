'use strict';

var path = require('path');
var del = require('delete');
var sitemap = require('..');
var assemble = require('assemble');
var dest = path.join.bind(path, __dirname, 'dist');

var app = module.exports = assemble();
app.use(sitemap());

app.onLoad(/\.hbs$/, function(file, next) {
  file.extname = '.html';
  next();
});

app.pages('test/fixtures/docs/*.hbs');

app.data('sitemap', {
  url: 'https://assemble.io',
  changefreq: 'daily',
  priority: '0.8'
});

app.task('default', ['delete'], function(cb) {
  app.toStream('pages')
    .pipe(app.renderFile())
    .pipe(app.sitemap())
    .pipe(app.dest(dest()));
});

app.task('delete', function(cb) {
  del(dest(), cb);
});

app.build(function(err) {
  if (err) return console.log(err);
});

