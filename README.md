## Usage

```js
var sitemap = require('assemble-sitemaps');
```

## FAQ

**How important is it to include `<lastmod>` in a sitemap?**

Given that most crawlers will still check the content directly and ignore this value anyway (since it's almost always wrong), it's not that important to use `<lastmod>`. 

It doesn't hurt to include it though.

For more information, see:

- [Google: We Mostly Ignore The LastMod Tag In XML Sitemaps](https://www.seroundtable.com/google-lastmod-xml-sitemap-20579.html)
- [Should a Sitemap include the home page?](http://webmasters.stackexchange.com/questions/92507/how-important-is-it-to-include-lastmod-in-a-sitemap)

**Should I include generated pages, like category or tag indexes that link to other pages?**

No. It's recommended that you only include URLs for "original" pages. Crawlers see these indexes as duplicate information.

