# Budget

A personal spending tracker built to answer one question every day: **how much can I actually spend today and stay on track?**

- Log expenses manually or bulk-import a bank/card CSV export
- Set an overall monthly budget, per-category budgets, recurring bills, and savings goals
- Get a daily "safe to spend" number computed from what's left, minus what's already earmarked for bills and goals
- Get an email when you're overspending or a goal is falling behind
- Optional AI coach that narrates your numbers in plain language (the numbers themselves are always the deterministic calculation, never AI-guessed)
- Installable as a PWA — add it to your phone's home screen, no app store needed

See [`DEVLOG.md`](./DEVLOG.md) for what's been built, why, and what's next — worth reading before picking this project back up in a new session.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind) — deployed on **Vercel** (free tier)
- **Supabase** — Postgres database, auth, and row-level security (free tier)
- **Resend** — transactional email for alerts (free tier)
- **Anthropic Claude** — optional AI insight narration
- No native app, no app store account: it's a PWA, installable straight from the browser

Total cost to run this yourself: **$0/month** on the free tiers above, until you're sending a lot of email or need more Supabase storage than the free tier gives you.

## Security notes

This app is built for one person to hold real spending data in, so security isn't an afterthought:

- **Single-user by design.** Signup locks itself shut after the first account is created (checked server-side) — there's no way for a second account to be created through the app once yours exists.
- **Two-factor authentication (TOTP)** is built in — set it up under Settings once you're signed in. It's enforced at the routing layer, not just offered: a session that has a verified authenticator but hasn't used it yet is redirected to the code challenge before it can reach any page, so a leaked password alone isn't enough to get in.
- Every table is scoped with Postgres **row-level security** — a user can only ever read or write their own rows, enforced by the database itself, not just application code.
- The Supabase **service-role key** (which bypasses RLS) is only ever used server-side, in the one cron route that has to look across users to decide who gets an alert email. It's never sent to the browser.
- Strict **security headers** on every response — Content-Security-Policy (no inline/eval scripts), HSTS, X-Frame-Options, Referrer-Policy, and a locked-down Permissions-Policy. See `next.config.ts`.
- CSV import parses the file in your browser and only sends structured rows (amount/date/note/category) to the server — the file itself is never uploaded or executed.
- All inputs are validated server-side with `zod` before touching the database, even though Server Actions also flow through the browser.
- The `/api/cron/daily-check` route requires a `CRON_SECRET` bearer token — nothing else can trigger it.
- AI insight requests send aggregated numbers and category names only — never your raw expense notes — to Anthropic.

### Recommended: harden Supabase Auth itself

A few settings live in the Supabase dashboard rather than in this codebase — worth turning on for a finance app:

- **Authentication → Settings → Password Protection**: enable "leaked password protection" (checks new passwords against HaveIBeenPwned) and set a minimum password length of at least 12.
- **Authentication → Settings → Confirm email**: leave this **on**. It doesn't add friction (you'll only ever sign up once) and it stops the one signup slot from being claimed by a mistyped or unowned email address.
- **Authentication → Rate Limits**: Supabase applies sane defaults out of the box; you can tighten them further here if you want.
- Rotate the `service_role` key (Project Settings → API) if you ever suspect it leaked — it's the one credential in this app that bypasses every access control.

## Setup

### 1. Supabase project

1. Create a free project at [supabase.com](https://supabase.com).
2. In the SQL editor, run the migration in `supabase/migrations/0001_init.sql`. It creates every table, RLS policy, and a trigger that bootstraps a new signed-up user with default categories.
3. In **Authentication → Providers**, email/password is enabled by default — leave "Confirm email" on under Authentication → Settings (see [Security notes](#security-notes) below for why).
4. Copy your Project URL, `anon` public key, and `service_role` secret key from **Project Settings → API**.

### 2. Resend (email alerts)

1. Create a free account at [resend.com](https://resend.com).
2. For real delivery, verify a domain you own; for quick testing you can send from `onboarding@resend.dev` without verifying anything.
3. Copy your API key.

### 3. Anthropic (optional, for the AI coach)

Get an API key from [console.anthropic.com](https://console.anthropic.com). If you skip this, the app still works — the "Get AI insight" button just says it isn't configured. The daily allowance number itself never depends on this.

### 4. Environment variables

Copy `.env.example` to `.env.local` and fill in the values above, plus a random `CRON_SECRET` (`openssl rand -hex 32`).

### 5. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, sign up (this is your one and only account — signup locks after this), turn on two-factor authentication under **Settings**, and set a monthly budget under **Budgets**.

### 6. Deploy to Vercel

1. Push this repo to GitHub and import it in [vercel.com](https://vercel.com).
2. Add all the same environment variables in the Vercel project settings.
3. Deploy. The cron job in `vercel.json` (`/api/cron/daily-check`, daily at 07:00 UTC) starts running automatically once deployed — Vercel's free tier includes daily cron jobs.
4. Open the deployed URL on your phone and use "Add to Home Screen" (Safari) or the install prompt (Chrome/Android) to install it as a PWA.

## How the daily allowance is calculated

This is deliberately **not** an AI guess — it's `src/lib/budget-engine.ts`, a plain formula:

```
reserved  = upcoming recurring bills still due this month
          + required monthly savings across active goals
available = overall monthly budget − spent so far this month − reserved
allowance = available ÷ days left in the month (including today)
```

The AI coach (when configured) only explains this number and the spending pattern behind it — it's never asked to invent the figure itself.

## Project structure

```
src/app/(app)/       protected routes: dashboard, expenses, budgets, goals, settings, import
src/app/login,signup dashboard-external auth pages
src/app/api/cron/     the daily alert-check endpoint Vercel Cron hits
src/lib/actions/      Server Actions (all mutations go through these)
src/lib/budget-engine.ts   the daily-allowance / pace math
src/lib/dashboard-data.ts  shared data-fetch used by both the dashboard and the cron job
src/lib/ai/insights.ts     Claude-powered narration of the computed numbers
src/lib/email/templates.ts alert email HTML
supabase/migrations/  full schema + RLS policies
```
