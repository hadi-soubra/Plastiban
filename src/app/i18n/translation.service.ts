import { DOCUMENT, PlatformLocation } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Lang, TRANSLATIONS } from './translations';

const STORAGE_KEY = 'plastiban-lang';

/**
 * Each language's page. Both are prerendered (app.routes.ts), so search engines
 * index the Arabic copy as its own page instead of never seeing it.
 */
export const LANG_PATHS: Record<Lang, string> = { en: '/', ar: '/ar/' };

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly document = inject(DOCUMENT);

  // Read off the URL, not storage: the prerendered HTML for a URL is always in
  // that URL's language, and hydration needs the browser to agree with it.
  readonly lang = signal<Lang>(langFromPath(inject(PlatformLocation).pathname));

  readonly isRtl = computed(() => this.lang() === 'ar');
  readonly dir = computed<'rtl' | 'ltr'>(() => (this.isRtl() ? 'rtl' : 'ltr'));
  /** The current language's page, for links and the address bar. */
  readonly path = computed(() => LANG_PATHS[this.lang()]);

  constructor() {
    effect(() => {
      const lang = this.lang();
      const root = this.document.documentElement;
      root.lang = lang;
      root.dir = this.dir();
      // Arabic gets its own type stack; a class on <html> lets one CSS rule
      // swap the family for the whole page instead of per-component overrides.
      root.classList.toggle('lang-ar', lang === 'ar');
    });
  }

  /** Looks up a key in the active language, falling back to English. */
  t(key: string): string {
    return TRANSLATIONS[this.lang()][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  /**
   * Switches language in place and moves the address bar to that language's
   * page, keeping the section the visitor is on. Browser only.
   */
  setLang(lang: Lang): void {
    this.lang.set(lang);
    history.replaceState(null, '', LANG_PATHS[lang] + location.hash);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Private-mode or blocked storage — the choice just won't persist.
    }
  }

  toggle(): void {
    this.setLang(this.lang() === 'en' ? 'ar' : 'en');
  }

  /**
   * A visitor who switched to Arabic before is taken back to it when they come
   * in on "/". Only a choice they made counts: switching on the browser's own
   * language would also hide the English page from crawlers that send one.
   * Browser only, once the page has hydrated.
   */
  restoreSavedLang(): void {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      return;
    }
    if (saved === 'ar' && isHome()) {
      this.setLang('ar');
    }
  }
}

function langFromPath(path: string): Lang {
  return path.replace(/\/+$/, '') === '/ar' ? 'ar' : 'en';
}

/** Only the bare home page redirects; an old /about link means English. */
function isHome(): boolean {
  return (location.pathname.replace(/\/+$/, '') || '/') === '/';
}
