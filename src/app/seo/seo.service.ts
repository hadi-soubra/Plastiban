import { Injectable, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { TranslationService } from '../i18n/translation.service';

/**
 * Keeps the document title and the language-dependent meta tags in sync with
 * the active language. Everything that never changes (Open Graph image, Twitter
 * card, JSON-LD, canonical) is static in index.html so crawlers see it without
 * executing JavaScript.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly i18n = inject(TranslationService);

  constructor() {
    effect(() => {
      const lang = this.i18n.lang();
      const title = this.i18n.t('seo.title');
      const description = this.i18n.t('seo.description');

      this.title.setTitle(title);
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ property: 'og:locale', content: lang === 'ar' ? 'ar_LB' : 'en_US' });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: description });
    });
  }
}
