'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var del = require('delete');
var assemble = require('assemble');
var exists = require('fs-exists-sync');
var through = require('through2');
var sitemap = require('..');

// build variables
var actual = path.join.bind(path, __dirname, 'actual');
var fixtures = path.join.bind(path, __dirname, 'fixtures');
var app;

function matches(re, filepath) {
  var str = fs.readFileSync(filepath, 'utf8');
  // console.log(str)
  return re.test(str);
}

describe('sitemap', function() {
  beforeEach(function() {
    app = assemble();
    app.use(sitemap());

    // custom collection
    app.create('posts');

    app.option('dest', actual());
    app.data('sitemap', {
      url: 'https://assemble.io',
      collection: 'posts',
      changefreq: 'daily',
      priority: '0.8'
    });

    app.onLoad(/\.hbs$/, function(file, next) {
      file.extname = '.html';
      next();
    });

    app.pages('docs/*.hbs', {cwd: fixtures()});
    app.posts('posts/*.hbs', {cwd: fixtures()});
  });

  // afterEach(function(cb) {
  //   del(actual(), cb);
  // });

  it('should generate a sitemap:', function(cb) {
    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap())
      .pipe(app.dest(app.options.dest))
      .on('end', function() {
        assert(exists(actual('sitemap.xml')));
        assert(matches(/aaa\.html/, actual('sitemap.xml')));
        cb();
      });
  });

  it('should generate a sitemap for the given collection:', function(cb) {
    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap('posts'))
      .pipe(app.dest(actual()))
      .on('end', function() {
        assert(exists(actual('sitemap.xml')));
        assert(matches(/aaa\.html/, actual('sitemap.xml')));
        cb();
      });
  });

  it('should generate a sitemap to the given destination:', function(cb) {
    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap())
      .pipe(app.dest(actual('blog')))
      .on('end', function() {
        assert(exists(actual('blog/sitemap.xml')));
        assert(matches(/blog\/aaa\.html/, actual('blog/sitemap.xml')));
        cb();
      });
  });

  it.only('should generate a sitemap for a specific collecion to a dest:', function(cb) {
    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap('posts', {dest: 'foo'}))
      .pipe(app.dest(actual('blog')))
      .on('end', function() {
        assert(exists(actual('blog/sitemap.xml')));
        cb();
      });
  });

  // it('should generate multiple sitemaps to multiple dests:', function(cb) {
  //   app.toStream('posts')
  //     .pipe(app.renderFile())
  //     .pipe(app.sitemap('posts', 'blog'))
  //     .pipe(app.sitemap('pages', 'docs'))
  //     .pipe(app.dest(app.options.dest))
  //     .on('end', function() {
  //       assert(exists(actual('blog/sitemap.xml')));
  //       assert(exists(actual('docs/sitemap.xml')));
  //       cb();
  //     });
  // });

  // it('should take a function to set the destination', function(cb) {
  //   app.toStream('pages')
  //     .pipe(app.renderFile())
  //     .pipe(app.sitemap('pages', function(file) {
  //       file.dirname = actual('docs');
  //       file.base = actual();
  //     }))
  //     .pipe(app.dest(app.options.dest))
  //     .on('end', function() {
  //       assert(exists(actual('docs/sitemap.xml')));
  //       cb();
  //     });
  // });

  // it('should take a function to set the destination for multiple sitemaps', function(cb) {
  //   app.toStream('pages')
  //     .pipe(app.toStream('posts'))
  //     .pipe(app.renderFile())
  //     .pipe(app.sitemap('posts', function(file) {
  //       file.dirname = actual('blog');
  //       file.base = actual();
  //     }))
  //     .pipe(app.sitemap('pages', function(file) {
  //       file.dirname = actual('docs');
  //       file.base = actual();
  //     }))
  //     .pipe(app.dest(app.options.dest))
  //     .on('end', function() {
  //       assert(exists(actual('blog/sitemap.xml')));
  //       assert(exists(actual('docs/sitemap.xml')));
  //       cb();
  //     });
  // });
});
