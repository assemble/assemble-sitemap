'use strict';

var path = require('path');
var dest = path.join.bind(path, __dirname, 'dist');
var del = require('delete');
var assemble = require('assemble');
var sitemap = require('..');

var app = module.exports = assemble();
app.use(sitemap());
app.cwd = __dirname;

app.onLoad(/\.hbs$/, function(file, next) {
  file.dirname += '/' + path.basename(file.base);
  file.extname = '.html';
  next();
});

// custom collection
app.create('posts');

// load templates
app.posts('test/fixtures/posts/*.hbs');
app.pages('test/fixtures/docs/*.hbs');

app.data('sitemap', {
  url: 'https://assemble.io',
  changefreq: 'daily',
  priority: '0.8'
});

app.task('default', function(cb) {
  return app.toStream('posts')
    .pipe(app.toStream('pages'))
    .pipe(app.renderFile())
    .pipe(app.sitemap('posts', {dest: 'posts'}))
    .pipe(app.sitemap('pages', {dest: 'docs'}))
    .pipe(app.dest(dest()));
});

app.task('delete', function(cb) {
  del(dest(), cb);
});

app.build(['delete', 'default'], function(err) {
  if (err) return console.log(err);
});
