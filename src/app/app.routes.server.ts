import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'ar', renderMode: RenderMode.Prerender },
  // Unknown paths are served the English page by Cloudflare's SPA fallback.
  { path: '**', renderMode: RenderMode.Client },
];
