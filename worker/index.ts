/**
 * The Worker that fronts the site.
 *
 * Cloudflare serves the built Angular bundle from the `assets` directory
 * configured in wrangler.jsonc. This script only exists for the one route the
 * static bundle cannot answer — the contact form's endpoint — and hands
 * everything else back to the asset server.
 *
 * `run_worker_first` in wrangler.jsonc guarantees /api/* reaches this code
 * rather than being resolved against the assets first.
 */
import { Env, handleContact } from './contact';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      return handleContact(request, env);
    }

    // No other /api route exists; say so rather than letting the SPA fallback
    // answer a mistyped endpoint with a page of HTML.
    if (url.pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: 'not_found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
