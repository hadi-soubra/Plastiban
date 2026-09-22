/**
 * Cloudflare Pages Function backing the contact form.
 *
 * Deployed automatically by Pages from this directory: the file path maps to
 * the route, so this answers POST /api/contact on the same origin as the site
 * (no CORS, no second service to run).
 *
 * The site keeps no database — a submission exists only as the email this
 * sends, so the send either succeeds or the visitor is told to try again.
 */

type OfficeId = 'lb' | 'ae';

interface Env {
  /** Resend API key. Set as an encrypted secret in the Pages dashboard. */
  RESEND_API_KEY: string;
  /** Verified sender, e.g. "Plastiban Website <website@send.plastiban.me>". */
  CONTACT_FROM?: string;
  /** Recipient overrides, so a mailbox can change without a code deploy. */
  CONTACT_TO_LB?: string;
  CONTACT_TO_AE?: string;
  /** Optional KV namespace; when bound, it rate-limits by IP across colos. */
  CONTACT_RATE_LIMIT?: KVNamespace;
}

interface Submission {
  name: string;
  email: string;
  phone: string;
  message: string;
  office: OfficeId;
  /** Honeypot: a real browser leaves this empty. */
  company?: string;
}

/**
 * Recipients are resolved from this table, never from the request body — the
 * client only ever names an office. Accepting an address from the client would
 * turn the endpoint into an open relay for our own verified domain.
 */
const RECIPIENTS: Record<OfficeId, { env: keyof Env; fallback: string; label: string }> = {
  lb: { env: 'CONTACT_TO_LB', fallback: 'info@plastiban.me', label: 'Lebanon' },
  ae: { env: 'CONTACT_TO_AE', fallback: 'uae@plastiban.me', label: 'U.A.E.' },
};

const MAX_LENGTHS: Record<keyof Omit<Submission, 'office' | 'company'>, number> = {
  name: 120,
  email: 200,
  phone: 40,
  message: 5000,
};

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_SECONDS = 600;

/**
 * Per-isolate fallback counter, used when no KV namespace is bound. An isolate
 * is neither shared between colos nor long-lived, so this only blunts a naive
 * flood — KV is what actually enforces the limit. It costs nothing and needs no
 * setup, which is why it runs either way.
 */
const recentByIp = new Map<string, number[]>();

/**
 * Without this, any method other than POST falls through to the static site and
 * hands back the homepage's HTML — a confusing answer from an API path.
 * Method-specific handlers still win, so onRequestPost below keeps POST.
 */
export const onRequest: PagesFunction<Env> = async () =>
  json({ error: 'method_not_allowed' }, 405);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: Partial<Submission>;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid_body' }, 400);
  }

  // Bots that fill every field get an ordinary success response: a failure
  // tells them what to change, a success tells them nothing.
  if (typeof body.company === 'string' && body.company.trim() !== '') {
    return json({ ok: true }, 202);
  }

  const submission = validate(body);
  if ('error' in submission) {
    return json({ error: submission.error }, 400);
  }

  const ip = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  if (await isRateLimited(ip, env)) {
    return json({ error: 'rate_limited' }, 429);
  }

  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return json({ error: 'send_failed' }, 500);
  }

  const office = RECIPIENTS[submission.office];
  const to = (env[office.env] as string | undefined) ?? office.fallback;
  const from = env.CONTACT_FROM ?? 'Plastiban Website <onboarding@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      // Replying in the mail client answers the visitor directly. Only set when
      // they gave an address; otherwise replies would bounce back to the site.
      ...(submission.email ? { reply_to: [submission.email] } : {}),
      subject: `Website enquiry (${office.label}) — ${submission.name}`,
      text: asText(submission, office.label),
      html: asHtml(submission, office.label),
    }),
  });

  if (!response.ok) {
    // Logged rather than returned: the upstream message can name the sending
    // domain and the key's account, which the visitor has no business seeing.
    console.error('Resend rejected the message', response.status, await response.text());
    return json({ error: 'send_failed' }, 502);
  }

  return json({ ok: true });
};

function validate(body: Partial<Submission>): Submission | { error: string } {
  const name = str(body.name);
  const email = str(body.email);
  const phone = str(body.phone);
  const message = str(body.message);
  const office = body.office;

  if (office !== 'lb' && office !== 'ae') {
    return { error: 'invalid_office' };
  }
  if (!name || !message) {
    return { error: 'missing_fields' };
  }
  // Mirrors the form's own rule: either way of reaching them back will do.
  if (!email && !phone) {
    return { error: 'missing_contact' };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'invalid_email' };
  }
  for (const [field, max] of Object.entries(MAX_LENGTHS)) {
    if (({ name, email, phone, message } as Record<string, string>)[field].length > max) {
      return { error: 'too_long' };
    }
  }

  return { name, email, phone, message, office };
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

async function isRateLimited(ip: string, env: Env): Promise<boolean> {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_SECONDS * 1000;

  const seen = (recentByIp.get(ip) ?? []).filter((at) => at > cutoff);
  seen.push(now);
  recentByIp.set(ip, seen);
  if (seen.length > RATE_LIMIT_MAX) {
    return true;
  }

  const kv = env.CONTACT_RATE_LIMIT;
  if (!kv) {
    return false;
  }

  const key = `contact:${ip}`;
  const count = Number((await kv.get(key)) ?? '0') + 1;
  // The TTL is not extended on each write, so the window slides forward from
  // the first request rather than trapping someone who keeps retrying.
  await kv.put(key, String(count), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
  return count > RATE_LIMIT_MAX;
}

function asText(submission: Submission, officeLabel: string): string {
  return [
    `New enquiry from the Plastiban website — addressed to ${officeLabel}.`,
    '',
    `Name:    ${submission.name}`,
    `Email:   ${submission.email || '—'}`,
    `Phone:   ${submission.phone || '—'}`,
    '',
    'Message:',
    submission.message,
  ].join('\n');
}

function asHtml(submission: Submission, officeLabel: string): string {
  const row = (label: string, value: string): string =>
    `<tr><td style="padding:4px 16px 4px 0;color:#64748b;font-size:13px;vertical-align:top">${label}</td>` +
    `<td style="padding:4px 0;color:#0f172a;font-size:14px">${escapeHtml(value || '—')}</td></tr>`;

  return `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;max-width:560px">
  <p style="margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#3055c8;font-weight:700">Website enquiry</p>
  <p style="margin:0 0 20px;color:#64748b;font-size:13px">Addressed to the ${escapeHtml(officeLabel)} office.</p>
  <table style="border-collapse:collapse">
    ${row('Name', submission.name)}
    ${row('Email', submission.email)}
    ${row('Phone', submission.phone)}
  </table>
  <p style="margin:20px 0 6px;color:#64748b;font-size:13px">Message</p>
  <div style="white-space:pre-wrap;color:#0f172a;font-size:14px;line-height:1.6;padding:12px 16px;background:#f8fafc;border-radius:8px">${escapeHtml(submission.message)}</div>
</div>`;
}

/** The message is attacker-controlled text landing in an HTML mail body. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
