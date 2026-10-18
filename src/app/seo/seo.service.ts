import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { SITE } from '../config/site';
import { TranslationService } from '../i18n/translation.service';

/**
 * Keeps the document title and the language-dependent meta tags in step with
 * the language toggle.
 *
 * The site is one page in two languages, "/" and "/ar/", each prerendered with
 * its own title, description and canonical URL by this service. index.html
 * declares everything that is the same on both (the hreflang links, the Open
 * Graph image, the Twitter card type, the organisation JSON-LD).
 * Section links ("/#products") need no tags of their own: search engines drop
 * the fragment and treat them all as the one page.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly i18n = inject(TranslationService);
  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const lang = this.i18n.lang();
      const title = this.i18n.t('seo.title');
      const description = this.i18n.t('seo.description');
      const url = SITE.origin + this.i18n.path();

      this.title.setTitle(title);
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ property: 'og:url', content: url });
      this.meta.updateTag({ property: 'og:locale', content: lang === 'ar' ? 'ar_LB' : 'en_US' });
      this.meta.updateTag({ property: 'og:locale:alternate', content: lang === 'ar' ? 'en_US' : 'ar_LB' });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: description });
      this.document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
    });
  }
}
