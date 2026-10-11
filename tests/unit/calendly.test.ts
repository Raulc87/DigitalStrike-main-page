// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCalendlyEmbed, loadCalendlyScript } from '../../src/lib/schedule/calendly';
import {
  CALENDLY_FALLBACK_MS,
  CALENDLY_SCRIPT_SRC,
  DEFAULT_CALENDLY_URL,
  calendlyUrl,
} from '../../src/lib/schedule/config';

// US-013: click-to-load, prefill after a submission, 10 s fallback.

const URL_ = 'https://calendly.com/rcasanas/1hr';

function elements() {
  document.body.innerHTML = `
    <div data-p></div>
    <div data-w hidden><p data-l></p><div data-c></div><p data-f hidden></p></div>`;
  const q = (s: string) => document.querySelector<HTMLElement>(s)!;
  return {
    preview: q('[data-p]'),
    widget: q('[data-w]'),
    container: q('[data-c]'),
    loading: q('[data-l]'),
    fallback: q('[data-f]'),
  };
}

beforeEach(() => vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] }));
afterEach(() => vi.useRealTimers());

describe('config', () => {
  it('defaults to the documented Calendly URL and the official script', () => {
    expect(DEFAULT_CALENDLY_URL).toBe('https://calendly.com/rcasanas/1hr');
    expect(calendlyUrl).toMatch(/^https:\/\/calendly\.com\//);
    expect(CALENDLY_SCRIPT_SRC).toBe('https://assets.calendly.com/assets/external/widget.js');
    expect(CALENDLY_FALLBACK_MS).toBe(10_000);
  });
});

describe('createCalendlyEmbed', () => {
  it('requests nothing until open()', () => {
    const loadScript = vi.fn(async () => {});
    createCalendlyEmbed(URL_, elements(), { loadScript });
    expect(loadScript).not.toHaveBeenCalled();
  });

  it('open() swaps the preview for the widget and initializes it', async () => {
    const els = elements();
    const initInlineWidget = vi.fn(({ parentElement }: { parentElement: HTMLElement }) => {
      parentElement.append(document.createElement('iframe'));
    });
    const embed = createCalendlyEmbed(URL_, els, {
      loadScript: async () => {},
      getApi: () => ({ initInlineWidget }),
    });
    await embed.open();
    expect(els.preview.hidden).toBe(true);
    expect(els.widget.hidden).toBe(false);
    expect(initInlineWidget).toHaveBeenCalledWith({ url: URL_, parentElement: els.container });
    vi.advanceTimersByTime(CALENDLY_FALLBACK_MS);
    expect(els.fallback.hidden).toBe(true);
  });

  it('re-initializes with name and email prefilled after a submission', async () => {
    const els = elements();
    const initInlineWidget = vi.fn();
    const embed = createCalendlyEmbed(URL_, els, {
      loadScript: async () => {},
      getApi: () => ({ initInlineWidget }),
    });
    await embed.open();
    els.container.append(document.createElement('iframe'));
    await embed.open({ name: 'Ana María Pérez', email: 'ana@example.com' });
    expect(initInlineWidget).toHaveBeenLastCalledWith({
      url: URL_,
      parentElement: els.container,
      prefill: { name: 'Ana María Pérez', email: 'ana@example.com' },
    });
    expect(els.container.querySelectorAll('iframe')).toHaveLength(0); // old widget cleared
  });

  it('shows the fallback at once when the script fails', async () => {
    const els = elements();
    const embed = createCalendlyEmbed(URL_, els, {
      loadScript: async () => {
        throw new Error('blocked');
      },
    });
    await embed.open();
    expect(els.fallback.hidden).toBe(false);
    expect(els.loading.hidden).toBe(true);
  });

  it('shows the fallback when the API is missing', async () => {
    const els = elements();
    const embed = createCalendlyEmbed(URL_, els, {
      loadScript: async () => {},
      getApi: () => undefined,
    });
    await embed.open();
    expect(els.fallback.hidden).toBe(false);
  });

  it('shows the fallback when nothing renders within 10 s', async () => {
    const els = elements();
    const embed = createCalendlyEmbed(URL_, els, {
      loadScript: () => new Promise(() => {}), // never loads
    });
    void embed.open();
    vi.advanceTimersByTime(CALENDLY_FALLBACK_MS - 1);
    expect(els.fallback.hidden).toBe(true);
    vi.advanceTimersByTime(1);
    expect(els.fallback.hidden).toBe(false);
  });
});

describe('loadCalendlyScript', () => {
  it('adds the official script once and resolves on load', async () => {
    const first = loadCalendlyScript(document);
    const second = loadCalendlyScript(document);
    expect(second).toBe(first);
    const scripts = document.head.querySelectorAll(`script[src="${CALENDLY_SCRIPT_SRC}"]`);
    expect(scripts).toHaveLength(1);
    scripts[0]!.dispatchEvent(new Event('load'));
    await expect(first).resolves.toBeUndefined();
  });
});
