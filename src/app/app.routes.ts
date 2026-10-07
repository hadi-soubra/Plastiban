import { Routes } from '@angular/router';

/**
 * Three pages rather than one long scroll. Each is lazy so a visitor only
 * downloads the page they asked for; the product wall in particular carries a
 * lot of markup that the about page has no use for.
 *
 * `data.seo` names the translation keys for that page's title and description.
 * They are keys, not strings, because the site is bilingual and the tags have
 * to follow the language toggle.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
    data: { seo: { title: 'seo.title', description: 'seo.description' } },
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about-page').then((m) => m.AboutPage),
    data: { seo: { title: 'seo.about.title', description: 'seo.about.description' } },
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact-page').then((m) => m.ContactPage),
    data: { seo: { title: 'seo.contact.title', description: 'seo.contact.description' } },
  },
  // Anything else is a mistyped or stale URL: send it home rather than showing
  // a blank shell.
  { path: '**', redirectTo: '' },
];
