import { Injectable, computed, effect, signal } from '@angular/core';
import { Lang, TRANSLATIONS } from './translations';

const STORAGE_KEY = 'plastiban-lang';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  readonly lang = signal<Lang>(readStoredLang());

  readonly isRtl = computed(() => this.lang() === 'ar');
  readonly dir = computed<'rtl' | 'ltr'>(() => (this.isRtl() ? 'rtl' : 'ltr'));

  constructor() {
    effect(() => {
      const lang = this.lang();
      const dir = this.dir();
      if (typeof document === 'undefined') {
        return;
      }
      const root = document.documentElement;
      root.lang = lang;
      root.dir = dir;
      // Arabic gets its own type stack; a class on <html> lets one CSS rule
      // swap the family for the whole page instead of per-component overrides.
      root.classList.toggle('lang-ar', lang === 'ar');
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch {
        // Private-mode or blocked storage — the choice just won't persist.
      }
    });
  }

  /** Looks up a key in the active language, falling back to English. */
  t(key: string): string {
    return TRANSLATIONS[this.lang()][key] ?? TRANSLATIONS.en[key] ?? key;
  }

  setLang(lang: Lang): void {
    this.lang.set(lang);
  }

  toggle(): void {
    this.lang.update((lang) => (lang === 'en' ? 'ar' : 'en'));
  }
}

function readStoredLang(): Lang {
  if (typeof window === 'undefined') {
    return 'en';
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ar') {
      return stored;
    }
  } catch {
    // Ignore and fall through to browser detection.
  }
  return navigator.language?.toLowerCase().startsWith('ar') ? 'ar' : 'en';
}
