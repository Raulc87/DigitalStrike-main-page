# Holding page ("Sitio en construcción") — DigitalStrike Solutions

A temporary, static page to publish at `digitalstrike-solutions.com` until the real site (Sprint 001) is deployed. Owner request, 2026-10-10. It is **not** part of the main page's code (`src/`), and it is replaced when the first GoDaddy release (US-017) is deployed.

- Approved identity: Palette 1, ball logo and tagline (`docs/ux/UX_UI_DIRECTION.md` §2 in PR #1).
- Bilingual: Spanish by default for Spanish browsers, English otherwise, with an ES | EN toggle (saved as `ds_lang`, same key as the main site).
- No form, no cookies, no analytics, no third-party requests (fonts are self-hosted; Calendly and LinkedIn are plain links). So no personal data is collected and no privacy notice is needed yet.
- `noindex`: search engines won't index the temporary text. The real site will be indexable.
- Fonts: Archivo and IBM Plex Mono (SIL Open Font License; licence files in `assets/fonts/`).

## Files to upload

```
index.html
.htaccess
assets/
  favicon.svg
  logo-mark-on-dark.svg
  logo-horizontal-dark.svg
  fonts/ (5 .woff2 + 2 licence files)
```

`holding-page.zip` in this folder contains exactly these files.

## Publish on GoDaddy (cPanel), about 10 minutes

1. **Domain and hosting:** buy `digitalstrike-solutions.com` and the cPanel (Linux) hosting plan, and attach the domain to the hosting (GoDaddy → My Products → Hosting → Manage). If the domain is bought at GoDaddy, DNS is set up automatically.
2. Open **cPanel → File Manager → `public_html`**. If GoDaddy placed a default `index.html` or `default.html` there, delete it (or rename it). In File Manager settings, enable "Show hidden files" so `.htaccess` is visible.
3. **Upload** `holding-page.zip` into `public_html`, right-click → **Extract**, then delete the zip. Check that `index.html` sits directly in `public_html`, not in a subfolder.
4. Open `http://digitalstrike-solutions.com`. You should see the page; try the ES | EN toggle and the three buttons.
5. **SSL:** in cPanel → **SSL/TLS Status**, run AutoSSL for the domain (free; can take a few minutes up to a few hours). The `.htaccess` in this folder already forces HTTPS (enabled on 2026-10-10, once the certificate was active). On a new host whose certificate isn't active yet, comment out the three `Rewrite…` lines until `https://` loads without a warning.

If GoDaddy offers "Website Builder" or "Coming soon" pages, ignore them; this page replaces them.

## Updating the email later

When the corporate mailbox exists, replace `rcasanas@gmail.com` in `index.html` (one `mailto:` link) and re-upload the file.
