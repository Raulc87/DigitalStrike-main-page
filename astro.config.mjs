// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv } from 'vite';

// Build-time configuration (US-001 AC4): the same code builds for GitHub Pages
// (PUBLIC_BASE_PATH=/DigitalStrike-main-page) and for the root domain (PUBLIC_BASE_PATH=/).
const env = {
  ...loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), 'PUBLIC_'),
  ...process.env,
};

/** @param {string | undefined} value */
function normalizeBase(value) {
  const trimmed = (value ?? '').trim().replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}` : '/';
}

const site = (env.PUBLIC_SITE_URL || 'http://localhost:4321').replace(/\/+$/, '');
const base = normalizeBase(env.PUBLIC_BASE_PATH);

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  i18n: {
    defaultLocale: 'es',
    locales: ['es', 'en'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  vite: { plugins: [tailwindcss()] },
});
