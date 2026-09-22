# Deploying the site & contact form

The site is a static Angular bundle plus a small Worker, both deployed to
Cloudflare Workers from this repo on every push to `main`.

Cloudflare serves the bundle straight from its asset store; the Worker only runs
for `/api/*`, which `run_worker_first` in `wrangler.jsonc` guarantees. Everything
else is handed back to the asset server, so the site costs no Worker
invocations.

```
Visitor submits form
  → POST /api/contact     (same origin, no CORS)
  → worker/index.ts       → worker/contact.ts
  → Resend HTTPS API
  → info@plastiban.me  (Lebanon)  /  uae@plastiban.me  (U.A.E.)
```

> Built for Workers rather than Pages because Cloudflare's own guidance is now
> "start new projects with Workers" — Pages still runs but is no longer where
> the platform is going.

Nothing is stored in a database. A submission exists only as the email it sends,
which is why a failed send leaves the visitor's text in the form to retry.

The office the visitor picks is sent as an ID (`lb` / `ae`), and the Worker
maps that ID to a recipient from a table in its own source. It never accepts an
email address from the browser — otherwise anyone could POST the endpoint and
make our verified domain send mail anywhere.

---

## 1. Resend (sending the mail)

Cloudflare Workers cannot open raw SMTP connections, so mail cannot be relayed
through the existing Microsoft 365 mailboxes. It goes out over an HTTPS API.

1. Create an account at <https://resend.com> — the free tier is 3,000 emails per
   month, far beyond what this form will use.
2. **API Keys → Create**, with *Sending access* only. Copy the `re_...` value; it
   is shown once.
3. **Domains → Add domain** → `send.plastiban.com`.

   Use that subdomain, not the bare `plastiban.com`. Company email keeps
   working untouched, because the records land on a name nothing else uses.

   Resend then shows three records to add in step 3 below. They look like:

   | Type | Name                 | Value                                      |
   |------|----------------------|--------------------------------------------|
   | MX   | `send`               | `feedback-smtp.<region>.amazonses.com` (priority 10) |
   | TXT  | `send`               | `v=spf1 include:amazonses.com ~all`        |
   | TXT  | `resend._domainkey`  | `p=MIGfMA0GCSqG...` (long DKIM key)        |

   Copy the exact values from the Resend dashboard — do not retype these.

Until that domain is verified, leave `CONTACT_FROM` unset. The function falls
back to Resend's shared `onboarding@resend.dev` sender, which only delivers to
the address that owns the Resend account — fine for testing, not for production.

> **Why a verified domain is required here:** `plastiban.com` publishes a strict
> SPF record (`v=spf1 include:spf.protection.outlook.com -all`) *and* a DMARC
> policy of `p=reject`. Together those tell receiving servers to refuse anything
> claiming to be from us that Microsoft did not send. Mail sent as
> `@plastiban.com` through Resend without these records is rejected outright —
> not junked, so there is no spam folder to find it in.
>
> The policy uses relaxed alignment (`adkim=r`, `aspf=r`), which is what makes
> the subdomain approach work: `send.plastiban.com` counts as the same
> organisational domain as `plastiban.com`, so a DKIM signature on the subdomain
> satisfies DMARC. There is no `sp=` tag, so the subdomain inherits `p=reject` —
> get the records exactly right and it passes; get them wrong and mail vanishes.

## 2. Cloudflare Workers (hosting)

1. <https://dash.cloudflare.com> → **Workers & Pages → Create → Import a
   repository** → pick `hadi-soubra/Plastiban`. Sign in to GitHub as the account
   that owns the repo, or it will not be listed.
2. Build settings:

   | Setting        | Value                 |
   |----------------|-----------------------|
   | Project name   | `plastiban`           |
   | Build command  | `npm run build`       |
   | Deploy command | `npx wrangler deploy` |

   There is no output-directory field: `wrangler.jsonc` already points at
   `dist/plastiban-web/browser`. The project name must match the `name` in
   `wrangler.jsonc`, or the deploy creates a second, empty Worker.

3. **Settings → Variables and Secrets**:

   | Name              | Value                                               | Type      |
   |-------------------|-----------------------------------------------------|-----------|
   | `RESEND_API_KEY`  | the `re_...` key from step 1                        | **Secret** |
   | `CONTACT_FROM`    | `Plastiban Website <website@send.plastiban.com>`    | Plaintext |
   | `CONTACT_TO_LB`   | `info@plastiban.me`  *(confirm — see note)*         | Plaintext |
   | `CONTACT_TO_AE`   | `uae@plastiban.me`   *(confirm — see note)*         | Plaintext |

   `RESEND_API_KEY` must be **Secret**, not plaintext — plaintext values are
   readable by anyone with dashboard access. The recipients are variables rather
   than hardcoded so a mailbox can change without a code deploy; leave them out
   and the Worker falls back to the same two addresses.

   `wrangler.jsonc` deliberately defines no `vars` block, so a deploy cannot
   overwrite what is set here. If you ever add one, it becomes the source of
   truth and dashboard edits get reverted on the next deploy.

   If the build needs a specific Node version, add `NODE_VERSION` = `22` under
   **Settings → Build → Variables**.

   > **Unconfirmed:** mailboxes exist on *both* `plastiban.com` and
   > `plastiban.me`. The `.me` addresses above are what the code shipped with;
   > whether those or the `.com` equivalents are the monitored inboxes is still
   > to be checked. Changing these variables needs no code deploy — but the
   > addresses *displayed* on the contact cards are in
   > `src/app/components/contact/contact.ts` and would need a code change too.

The first deploy lands on a free `*.workers.dev` URL. Test the form there
before touching any DNS.

## 3. DNS (`plastiban.com` and `plastiban.me`)

"DNS" is the record list that says which server answers for a domain. Both
Plastiban domains are managed at **GoDaddy** today. Someone at the company has
that login — possibly whoever built the previous site.

### How it works now

| Domain          | Today                                              | After |
|-----------------|----------------------------------------------------|-------|
| `plastiban.com` | GoDaddy forwarding, 301 → `https://plastiban.me/`  | **The site** |
| `plastiban.me`  | The live nginx site on Google Cloud (`35.214.216.103`) | 301 → `plastiban.com` |

The two swap roles: `.com` becomes the real address and `.me` becomes the
signpost. Both domains keep their Microsoft 365 mailboxes either way.

### Move the nameservers to Cloudflare

This is not optional for a bare domain. `plastiban.com` with no `www` cannot be
pointed at Pages from GoDaddy, because DNS does not allow a CNAME at the root of
a domain. Cloudflare works around this with CNAME flattening, which only applies
when Cloudflare runs the DNS.

**Order matters, because getting it wrong takes down company email.** Do this for
`plastiban.com` first, then repeat for `plastiban.me`:

1. In Cloudflare, **Add a site** → `plastiban.com`. It scans GoDaddy and imports
   the existing records. Pick the **Free** plan when offered.
2. **Check the imported records before switching anything.** This is the step
   that breaks company email if rushed. Every row below exists today and must
   exist in Cloudflare *before* the nameservers change:

   | Type  | Name                     | Value                                          |
   |-------|--------------------------|------------------------------------------------|
   | MX    | `@`                      | `plastiban-com.mail.protection.outlook.com` (priority 0) |
   | TXT   | `@`                      | `v=spf1 include:spf.protection.outlook.com -all` |
   | TXT   | `_dmarc`                 | `v=DMARC1; p=reject; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;` |
   | CNAME | `autodiscover`           | `autodiscover.outlook.com`                     |
   | CNAME | `enterpriseregistration` | `enterpriseregistration.windows.net`           |
   | CNAME | `enterpriseenrollment`   | `enterpriseenrollment-s.manage.microsoft.com`  |
   | CNAME | `lyncdiscover`           | `webdir.online.lync.com`                       |
   | CNAME | `sip`                    | `sipdir.online.lync.com`                       |

   **Set every one of those CNAMEs to DNS only (grey cloud), not Proxied
   (orange cloud).** Proxying `autodiscover` breaks Outlook account setup, and
   proxying `sip` / `lyncdiscover` breaks Teams. Cloudflare's importer usually
   gets this right, but it is worth checking each row by eye.

   `plastiban.me` carries the same set, with `plastiban-me.mail.protection
   .outlook.com` as its MX, `enterpriseenrollment.manage.microsoft.com`
   (no `-s`), and no `_dmarc` record.

   > Neither domain currently has Microsoft DKIM records
   > (`selector1`/`selector2._domainkey`), so Microsoft 365 mail is passing
   > DMARC on SPF alignment alone. That is pre-existing and not something this
   > migration changes — but it is worth turning on in Microsoft 365 at some
   > point, given `p=reject`.

3. Change the nameservers at GoDaddy to the pair Cloudflare gives you.
   Propagation takes anywhere from minutes to a few hours; Cloudflare emails you
   when the zone goes **Active**.

   Leave the two forwarding `A` records (`3.33.251.168` / `15.197.225.128`) in
   place for this step. They are GoDaddy's redirect service, and keeping them
   means `.com` carries on redirecting to `.me` while the nameservers settle,
   rather than going dark.
4. **Once the zone is Active, check mail before doing anything else.** Send a
   message to an `@plastiban.com` address from an outside account and confirm it
   arrives. If it does not, the records are wrong — switch the nameservers back
   at GoDaddy while you work out which one.
5. Now swap the redirect for the real site: delete those two forwarding `A`
   records, then in **Workers & Pages → `plastiban` → Settings → Domains &
   Routes** add `plastiban.com` and `www.plastiban.com`. Cloudflare creates the
   records itself.
6. Add the three Resend records from step 1 to the `plastiban.com` zone, then
   hit **Verify** in Resend. Once it passes, set `CONTACT_FROM` to
   `Plastiban Website <website@send.plastiban.com>` in the Worker's variables —
   that is what lifts Resend's test-mode restriction and makes the U.A.E. route
   work.

### Point `.me` at the new site

Once `.com` is serving, repeat steps 1–4 for `plastiban.me` (its MX is
`plastiban-me.mail.protection.outlook.com`), then instead of adding it as a
custom domain, send it to `.com` with a redirect:

**Rules → Redirect Rules → Create rule**, matching `Hostname equals
plastiban.me` (add a second rule or an `or` for `www.plastiban.me`), with a
**Dynamic** target of `concat("https://plastiban.com", http.request.uri.path)`
and status **301**. That preserves the path, so any old deep link still lands in
the right place.

Free plan includes 10 single redirect rules; this uses one or two.

The old nginx box keeps serving `plastiban.me` until its nameservers change in
this step, so there is no gap — but **do decommission that Google Cloud VM
afterwards**, since it is almost certainly still being billed.

## Local development

```bash
npm start                  # Angular dev server; the form will 404 on /api/contact
```

To run the Worker as well:

```bash
cp .dev.vars.example .dev.vars   # then put a real Resend key in it
npm run build
npm run dev:worker               # serves the built site + /api/contact on :8787
```

`npm run deploy` builds and deploys by hand, should you ever need to bypass the
Git integration.

`.dev.vars` is gitignored. Never commit a real key.

## Optional: stronger rate limiting

The Worker rate-limits by IP (5 submissions per 10 minutes). By default the
counter lives in the worker's memory, which is per-datacentre and short-lived —
enough to blunt a naive flood, alongside the honeypot field that catches most
bots outright.

To enforce it properly, create a KV namespace (**Workers & Pages → KV → Create**)
and bind it to the Worker under **Settings → Bindings** with the variable name
`CONTACT_RATE_LIMIT`. The Worker picks it up automatically; no code change.
