import { Injectable, effect, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { SITE } from '../config/site';
import { TranslationService } from '../i18n/translation.service';

interface RouteSeo {
  title: string;
  description: string;
}

const DEFAULT_SEO: RouteSeo = { title: 'seo.title', description: 'seo.description' };

/**
 * Keeps the document title, the language-dependent meta tags and the canonical
 * URL in sync with both the active language and the active route.
 *
 * Each route names translation keys rather than finished strings, so one effect
 * covers both axes: change the page or change the language and the same code
 * rewrites the tags. What never varies - the Open Graph image, the Twitter card
 * type, the organisation JSON-LD - stays static in index.html so crawlers see
 * it without running any JavaScript.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);

  private readonly route = signal<{ seo: RouteSeo; url: string }>({
    seo: DEFAULT_SEO,
    url: '/',
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        let deepest = this.router.routerState.snapshot.root;
        while (deepest.firstChild) {
          deepest = deepest.firstChild;
        }
        this.route.set({
          seo: (deepest.data['seo'] as RouteSeo | undefined) ?? DEFAULT_SEO,
          // urlAfterRedirects, so the wildcard route reports "/" rather than
          // whatever was mistyped.
          url: event.urlAfterRedirects.split('?')[0],
        });
      });

    effect(() => {
      const lang = this.i18n.lang();
      const { seo, url } = this.route();
      const title = this.i18n.t(seo.title);
      const description = this.i18n.t(seo.description);
      const canonical = SITE.origin + (url === '/' ? '/' : url);

      this.title.setTitle(title);
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ property: 'og:url', content: canonical });
      this.meta.updateTag({ property: 'og:locale', content: lang === 'ar' ? 'ar_LB' : 'en_US' });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: description });
      this.setCanonical(canonical);
    });
  }

  /** index.html ships a canonical for the home page; this retargets it. */
  private setCanonical(href: string): void {
    if (typeof document === 'undefined') {
      return;
    }
    let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = href;
  }
}
