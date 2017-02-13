
Register the helpers:

```js
var sitemap = require('helper-sitemap');
app.helpers('entry', sitemap.entry);
```

## Sitemap for a collection

```js
app.create('posts');
app.posts('src/posts/*.md');

app.task('blog', ['preload'], function() {
  return app.toStream('posts')
    .pipe(app.renderFile())
    .pipe(app.dest('my-blog'));
});

app.task('sitemap', function() {
  return app.src('templates/sitemap.hbs')
    .pipe(app.renderFile({collections: 'posts'}))
    .pipe(app.dest(function(file) {
      file.basename = 'sitemap.xml';
      return 'my-blog';
    }));
});
```


## Sitemap for multiple collections

```js
app.task('pages', ['preload'], function() {
  return app.toStream('pages')
    .pipe(app.toStream('posts'))
    .pipe(app.renderFile())
    .pipe(app.dest(dest()));
});

app.task('sitemap', function() {
  return app.src('templates/entries.hbs')
    .pipe(app.renderFile({collections: ['pages', 'posts']}))
    .pipe(app.dest(function(file) {
      file.basename = 'sitemap.xml';
      return dest();
    }));
});
```



Add `sitemap.foo` to the context, where `foo` is one or names of the collections to include in the sitemap:

```js
{sitemap: ['pages', 'posts']}
```

For example:

```js
app.data({sitemap: ['pages', 'posts']});
```

Or on a task:

```js
.pipe(app.renderFile({sitemap: ['pages', 'posts']}))
```