'use strict';

var path = require('path');
var dest = path.join.bind(path, __dirname, 'dist');
var del = require('delete');
var assemble = require('assemble');
var viewFs = require('view-fs');
var sitemap = require('..');

var app = module.exports = assemble();
app.use(sitemap());
app.use(viewFs());

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
    .pipe(app.dest(dest()))
    .on('end', function() {
      var view = app.view('templates/sitemap.hbs')
        // .render(function(err, view) {
        //   if (err) return cb(err);
        //   view.write(dest('whatever/'), cb);
        // });

      console.log(view.content);
      cb();
    })
});

app.task('delete', function(cb) {
  del('dist', cb);
});

app.build(function(err) {
  if (err) return console.log(err);
});

