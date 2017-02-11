'use strict';

require('mocha');
var fs = require('fs');
var path = require('path');
var assert = require('assert');
var del = require('delete');
var assemble = require('assemble');
var exists = require('fs-exists-sync');
var sitemap = require('..');

// build variables
var actual = path.join.bind(path, __dirname, 'actual');
var fixtures = path.join.bind(path, __dirname, 'fixtures');
var app;

// util for matching fixtures
function matches(re, filepath) {
  var str = fs.readFileSync(filepath, 'utf8');
  return re.test(str);
}

describe('sitemap', function() {
  beforeEach(function() {
    app = assemble();
    app.use(sitemap());

    // custom collection
    app.create('posts');

    app.data('sitemap', {
      url: 'https://assemble.io',
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

  afterEach(function(cb) {
    del(actual(), cb);
  });

  it('should generate a sitemap when `app.options.dest` is not defined:', function(cb) {
    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap())
      .pipe(app.dest(actual()))
      .on('end', function() {
        assert(exists(actual('sitemap.xml')));
        assert(matches(/xxx\.html/, actual('sitemap.xml')));
        cb();
      });
  });

  it('should generate a sitemap:', function(cb) {
    app.option('dest', actual());

    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap())
      .pipe(app.dest(app.options.dest))
      .on('end', function() {
        assert(exists(actual('sitemap.xml')));
        assert(matches(/xxx\.html/, actual('sitemap.xml')));
        cb();
      });
  });

  it('should generate a sitemap for the given collection:', function(cb) {
    app.option('dest', actual());

    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap('posts'))
      .pipe(app.dest(actual()))
      .on('end', function() {
        assert(exists(actual('sitemap.xml')));
        assert(matches(/xxx\.html/, actual('sitemap.xml')));
        cb();
      });
  });

  it('should generate a sitemap to the given destination:', function(cb) {
    app.option('dest', actual());

    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap())
      .pipe(app.dest(actual('blog')))
      .on('end', function() {
        assert(exists(actual('blog/sitemap.xml')));
        assert(matches(/blog\/xxx\.html/, actual('blog/sitemap.xml')));
        cb();
      });
  });

  it('should set changefreq on sitemap property in front-matter', function(cb) {
    app.option('dest', actual());

    app.data('sitemap', {changefreq: 'whatever'});

    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap())
      .pipe(app.dest(actual('blog')))
      .on('end', function() {
        assert(exists(actual('blog/sitemap.xml')));
        assert(matches(/<changefreq>foo<\/changefreq>/, actual('blog/sitemap.xml')));
        assert(matches(/<changefreq>whatever<\/changefreq>/, actual('blog/sitemap.xml')));
        cb();
      });
  });

  it('should set changefreq on root of front-matter', function(cb) {
    app.option('dest', actual());

    app.data('sitemap', {changefreq: 'whatever'});

    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap())
      .pipe(app.dest(actual('blog')))
      .on('end', function() {
        assert(exists(actual('blog/sitemap.xml')));
        assert(matches(/<changefreq>foo<\/changefreq>/, actual('blog/sitemap.xml')));
        assert(matches(/<changefreq>bar<\/changefreq>/, actual('blog/sitemap.xml')));
        assert(matches(/<changefreq>whatever<\/changefreq>/, actual('blog/sitemap.xml')));
        cb();
      });
  });

  it('should use `lastmod` date from front matter', function(cb) {
    app.option('dest', actual());

    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap())
      .pipe(app.dest(actual('blog')))
      .on('end', function() {
        assert(exists(actual('blog/sitemap.xml')));
        assert(matches(/<lastmod>2012-07-01<\/lastmod>/, actual('blog/sitemap.xml')));
        cb();
      });
  });

  it('should use `lastModified` date from front matter', function(cb) {
    app.option('dest', actual());

    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap())
      .pipe(app.dest(actual('blog')))
      .on('end', function() {
        assert(exists(actual('blog/sitemap.xml')));
        assert(matches(/<lastmod>2012-01-01<\/lastmod>/, actual('blog/sitemap.xml')));
        cb();
      });
  });

  it('should generate a sitemap for a specific collecion to a dest:', function(cb) {
    app.option('dest', actual());

    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap('posts', {dest: 'foo', cwd: __dirname}))
      .pipe(app.dest(actual('blog')))
      .on('end', function() {
        assert(exists(actual('blog/foo/sitemap.xml')));
        cb();
      });
  });

  it('should generate multiple sitemaps to multiple dests:', function(cb) {
    app.option('dest', actual());

    app.toStream('posts')
      .pipe(app.renderFile())
      .pipe(app.sitemap('posts', 'blog'))
      .pipe(app.sitemap('pages', 'docs'))
      .pipe(app.dest(app.options.dest))
      .on('end', function() {
        assert(exists(actual('blog/sitemap.xml')));
        assert(exists(actual('docs/sitemap.xml')));
        cb();
      });
  });

  it('should take a function to set the destination', function(cb) {
    app.option('dest', actual());

    app.toStream('pages')
      .pipe(app.renderFile())
      .pipe(app.sitemap('pages', function(file) {
        file.dirname = actual('docs');
        file.base = actual();
      }))
      .pipe(app.dest(app.options.dest))
      .on('end', function() {
        assert(exists(actual('docs/sitemap.xml')));
        cb();
      });
  });

  it('should take a function to set the destination for multiple sitemaps', function(cb) {
    app.option('dest', actual());

    app.toStream('pages')
      .pipe(app.toStream('posts'))
      .pipe(app.renderFile())
      .pipe(app.sitemap('posts', function(file) {
        file.dirname = actual('blog');
        file.base = actual();
      }))
      .pipe(app.sitemap('pages', function(file) {
        file.dirname = actual('docs');
        file.base = actual();
      }))
      .pipe(app.dest(app.options.dest))
      .on('end', function() {
        assert(exists(actual('blog/sitemap.xml')));
        assert(exists(actual('docs/sitemap.xml')));
        cb();
      });
  });

  it('should work when dest is a function', function(cb) {
    app.option('dest', actual());

    app.toStream('pages')
      .pipe(app.toStream('posts'))
      .pipe(app.renderFile())
      .pipe(app.sitemap('posts', function(file) {
        file.dirname = actual('blog');
        file.base = actual();
      }))
      .pipe(app.sitemap('pages', function(file) {
        file.dirname = actual('docs');
        file.base = actual();
      }))
      .pipe(app.dest(function(file) {
        return app.options.dest;
      }))
      .on('end', function() {
        assert(exists(actual('blog/sitemap.xml')));
        assert(exists(actual('docs/sitemap.xml')));
        cb();
      });
  });

  it('should use a custom template to generate a sitemap.xml', function(cb) {
    app.option('dest', actual());

    app.toStream('pages')
      .pipe(app.renderFile())
      .pipe(app.sitemap({template: fixtures('sitemap.hbs')}))
      .pipe(app.dest(app.options.dest))
      .on('end', function() {
        assert(exists(actual('sitemap.xml')));
        cb();
      });
  });

  it('should throw an error when an invalid sitemap entry is used', function(cb) {
    app.option('dest', actual());

    app.toStream('pages')
      .pipe(app.renderFile())
      .pipe(app.sitemap({template: fixtures('sitemap-bad.hbs')}))
      .on('error', function(err) {
        assert(/flalalallalla/.test(err.message));
        cb();
      });
  });
});
