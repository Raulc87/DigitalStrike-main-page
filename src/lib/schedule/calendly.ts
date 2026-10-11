// Click-to-load Calendly inline widget (US-013, FR-016). Nothing is requested from Calendly until
// `open()` runs: after the visitor clicks "Ver horarios disponibles" or submits the lead form.
import { CALENDLY_FALLBACK_MS, CALENDLY_SCRIPT_SRC } from './config';

export interface CalendlyPrefill {
  name: string;
  email: string;
}

interface CalendlyApi {
  initInlineWidget(options: {
    url: string;
    parentElement: HTMLElement;
    prefill?: CalendlyPrefill;
  }): void;
}

declare global {
  interface Window {
    Calendly?: CalendlyApi;
  }
}

let scriptPromise: Promise<void> | null = null;

/** Adds the widget script once; resolves when it loaded, rejects if it failed. */
export function loadCalendlyScript(doc: Document = document): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = doc.createElement('script');
    script.src = CALENDLY_SCRIPT_SRC;
    script.async = true;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', () => {
      scriptPromise = null; // a later open() may retry
      script.remove();
      reject(new Error('calendly script failed'));
    });
    doc.head.append(script);
  });
  return scriptPromise;
}

export interface CalendlyElements {
  preview: HTMLElement;
  widget: HTMLElement;
  container: HTMLElement;
  loading: HTMLElement;
  fallback: HTMLElement;
}

export interface CalendlyDeps {
  loadScript?: () => Promise<void>;
  getApi?: () => CalendlyApi | undefined;
  fallbackMs?: number;
}

/** Controls one scheduling section. */
export function createCalendlyEmbed(
  url: string,
  els: CalendlyElements,
  {
    loadScript = () => loadCalendlyScript(),
    getApi = () => window.Calendly,
    fallbackMs = CALENDLY_FALLBACK_MS,
  }: CalendlyDeps = {},
) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;

  const rendered = () => els.container.querySelector('iframe') !== null;

  function showFallback(): void {
    els.loading.hidden = true;
    els.fallback.hidden = false;
  }

  const observer =
    typeof MutationObserver === 'undefined'
      ? null
      : new MutationObserver(() => {
          if (rendered()) els.loading.hidden = true;
        });
  observer?.observe(els.container, { childList: true, subtree: true });

  /** Loads (or re-initializes, e.g. with a prefill after a submission) the inline widget. */
  async function open(prefill?: CalendlyPrefill): Promise<void> {
    const current = ++generation;
    clearTimeout(timer);
    els.preview.hidden = true;
    els.widget.hidden = false;
    els.fallback.hidden = true;
    els.loading.hidden = false;
    els.container.replaceChildren();
    timer = setTimeout(() => {
      if (current === generation && !rendered()) showFallback();
    }, fallbackMs);
    try {
      await loadScript();
      const api = getApi();
      if (!api) throw new Error('Calendly API missing');
      if (current !== generation) return;
      api.initInlineWidget({
        url,
        parentElement: els.container,
        ...(prefill ? { prefill } : {}),
      });
    } catch {
      if (current === generation) {
        clearTimeout(timer);
        showFallback();
      }
    }
  }

  return { open };
}
