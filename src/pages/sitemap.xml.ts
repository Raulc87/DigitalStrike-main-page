import type { APIRoute } from 'astro';
import { routes } from '../lib/i18n/routes';
import { LOCALES, withBase } from '../lib/i18n/url';

export const GET: APIRoute = ({ site }) => {
  const abs = (path: string) => new URL(withBase(path), site).href;
  const entries = Object.values(routes).flatMap((route) =>
    LOCALES.map((locale) => {
      const alternates = [
        ...LOCALES.map(
          (alt) => `    <xhtml:link rel="alternate" hreflang="${alt}" href="${abs(route[alt])}"/>`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${abs('')}"/>`,
      ].join('\n');
      return `  <url>\n    <loc>${abs(route[locale])}</loc>\n${alternates}\n  </url>`;
    }),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
