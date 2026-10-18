import { Routes } from '@angular/router';

/**
 * The site is one page in two languages: English at "/" and Arabic at "/ar/".
 * Both render the same App, which reads the language off the URL, so these
 * routes carry no components. They exist so the build knows to prerender both
 * pages (app.routes.server.ts); only the build uses them (app.config.server.ts).
 * Anything else still gets the English page and is folded back onto "/" by App.
 */
export const routes: Routes = [
  { path: '', children: [] },
  { path: 'ar', children: [] },
  { path: '**', children: [] },
];
