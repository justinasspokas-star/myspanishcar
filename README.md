# MySpanishCar website prototype

Responsive static comparison-site prototype for `myspanishcar.com`.

## Included
- Minimal, trust-focused responsive homepage
- Search form with demo pricing logic
- Example results with price, deposit, card, fuel and pickup details
- SEO title, meta description, canonical, Open Graph and structured data
- SVG favicon/logo mark
- `robots.txt`, `sitemap.xml`, web manifest
- Affiliate and live-price disclaimers

## Publish on Hostinger
1. Open Hostinger File Manager for `myspanishcar.com`.
2. Upload the contents of this folder to `public_html`.
3. Make sure `index.html` is directly inside `public_html`.
4. Enable SSL/HTTPS.
5. Replace example result buttons with approved affiliate deep links or embed the provider widget/API.

## Before commercial launch
- Add real Privacy, Cookie and Terms pages.
- Install a consent platform before loading analytics/non-essential cookies.
- Add affiliate IDs only after approval.
- Do not present demo prices as live prices.
- Confirm every deposit/card condition from the partner feed or supplier terms.
- Replace prototype airport links with unique SEO landing pages.

## Affiliate integration
The buttons currently display a reminder toast. In `script.js`, replace that behavior with a properly attributed affiliate URL or approved partner widget. Do not invent live prices without a data feed.


## Mobile update v3
- Compact responsive header
- Hero text is always shown before the image on mobile
- Smaller mobile-specific hero image
- Improved trust badges and search-card spacing
- Includes `CNAME` for `myspanishcar.com` and `.nojekyll` for GitHub Pages

Upload every file and folder in this directory to the root of the GitHub repository.


## v5
- Added an accessible hamburger menu for tablet and mobile.
- Mobile links: Compare cars, Why us, Airports and FAQ.

## Google Analytics 4

Measurement ID installed in `index.html`: `G-K1D72W9P67`.

## Version 7: cookie consent and legal pages

- Google Analytics `G-K1D72W9P67` now uses a **basic Consent Mode v2 implementation**: the Google tag does not load until analytics consent is granted.
- The first layer provides equally accessible accept, reject and configure actions.
- Consent is stored in local storage for up to 180 days and can be changed from the footer.
- Added `cookies.html`, `privacy.html`, `legal.html` and `affiliate-disclosure.html`.

### Required before commercial launch
Replace the legal-operator placeholder information in `privacy.html` and `legal.html` with the operator's full legal name, tax identification number, registration details and postal address. This technical template is not a substitute for legal review.
