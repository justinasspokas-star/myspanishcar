# MySpanishCar v29 — Search Console cleanup

Changes:
- Normalized Dutch `/nl/` URLs to directory URLs with trailing slashes.
- Confirmed Madrid NL canonical URL ends with `/`.
- Removed legal/privacy/cookie/affiliate disclosure pages from `sitemap.xml`.
- Added `noindex,follow` to those four support/legal pages.
- Kept Palma Airport and all commercial/airport pages indexable and in the sitemap.
- `sitemap.xml` itself remains crawlable; it is normal that Google does not index XML sitemaps as search results.

After deployment:
1. Open the Madrid NL URL with trailing slash and verify it loads.
2. In Search Console, validate the Redirect error.
3. Inspect `https://myspanishcar.com/palma-airport-car-rental.html` and request indexing.
4. Resubmit `https://myspanishcar.com/sitemap.xml`.
