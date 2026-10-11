import type { APIRoute } from 'astro';
import { withBase } from '../lib/i18n/url';

export const GET: APIRoute = ({ site }) => {
  const noindex = import.meta.env.PUBLIC_NOINDEX === 'true';
  const lines = noindex
    ? ['User-agent: *', 'Disallow: /']
    : ['User-agent: *', 'Allow: /', `Sitemap: ${new URL(withBase('sitemap.xml'), site).href}`];
  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
