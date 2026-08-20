# Dev Log

Running record of what's been built, why, and what's next — kept in git so it
survives between sessions (human or AI). Read **Current Status** first when
picking this project back up; the dated log below it has the reasoning
behind decisions that aren't obvious from the diff alone.

When you finish a chunk of work, add an entry at the **top** of the log
(newest first) instead of editing old entries — this file is a history, not
just a snapshot.

---

## Current Status (as of 2026-08-20)

**Live on `master`:** a working single-user budget PWA — Next.js 16 +
Supabase + Resend + optional Claude coaching, described in full in
`README.md`. Merged via PR #2 and PR #3 (see log below).

**Not started yet:**
- **Pockets/vaults feature** — Revolut-style split: a "main pocket" you can
  actually spend from, with the rest auto-allocated to savings pockets.
  Discussed and scoped (see 2026-08-20 entry below) but no schema or UI
  exists yet. This is the next big feature.
- **Revolut CSV import** — the user uploaded two real Revolut "consolidated
  statement" exports. These are *not* simple transaction CSVs — they're
  multi-section reports (account summaries with IBANs, several
  differently-shaped itemized-transaction blocks per currency/pocket).
  Deliberately not built: needs its own parser and explicit confirmation
  before writing account-number-bearing data anywhere. Decide with the user
  whether this is still wanted before starting it.
- **No automated tests.** `src/lib/budget-engine.ts` (the daily-allowance
  math) is the one piece of logic a bug in would silently mislead the user
  about their own money — it's pure functions and would be cheap to unit
  test. Worth doing before the codebase grows much further.
- **No CI.** Every `tsc` / `eslint` / `next build` check so far has been run
  manually in-session before pushing. A GitHub Actions workflow running the
  same three checks on every PR would catch regressions automatically.
- **No real Supabase project wired up yet.** Everything has been verified
  against placeholder env vars (`tsc`, `eslint`, `next build`, and a
  Playwright screenshot of the public login/signup pages). The
  auth/dashboard/expenses/budgets/goals/settings flows have never run
  against live data — that needs an actual Supabase project (see README
  setup steps) plus a manual click-through.

**Known simplifications** (intentional, not bugs — revisit if they start to
matter):
- Recurring bills have no "paid" flag. The daily-allowance engine assumes a
  bill is still owed if `due_day >= today's day-of-month`, and already paid
  otherwise. Fine for predictable monthly bills, wrong if a bill is paid
  early or late in a way that crosses that boundary.
- CSV import's date parser guesses MM/DD vs DD/MM by checking whether the
  first segment is ≤12; genuinely ambiguous dates (e.g. `03/04`) can be
  misparsed. There's no column-level override for it, just the ability to
  see the parsed row count before importing.
- The design tokens keep the original `--surface` naming rather than
  renaming to shadcn's conventional `--card`/`--popover` — done to avoid a
  mechanical rename across ~15 files for no functional benefit.

---

## Log

### 2026-08-20 — Modular design system + dark retheme (PR #3, merged)

**What:** Built an owned component library in `src/components/ui/`
(Button, Card, Alert, Badge, Switch, Dialog, Input/Label/Select) on Radix
primitives + `class-variance-authority`, plus two composite patterns:
`OptionCard` (tinted-border selection tile) and `ToggleRow` (a toggle in its
own semantic-colored card). Retheme to a dark-first palette — near-black
background, emerald primary, blue/amber secondary accents — replacing the
old indigo light/dark pair. Swept every existing page onto the new
primitives so the look is consistent everywhere, not just new screens.

**Why this approach over alternatives:** Radix gives real accessibility
(focus traps, ARIA, keyboard nav) for free; `cva` gives typed variant props
instead of hand-concatenated className strings. Copying component *source*
into the repo (the shadcn/ui pattern, hand-assembled rather than via its
CLI) means no opaque upstream dependency and no surprise breaking changes —
important for a codebase meant to be worked on across many separate
sessions. Doing this *before* the pockets feature was deliberate: pockets
will need Card/Badge/Alert too, so building the system first means it's
consistent from day one instead of a retrofit.

**Visual direction:** the user pointed at 38-0.app (a Premier League squad
-draft web game — unrelated to finance, cited purely for look and feel) and
sent screenshots. Design language extracted from those screenshots (not
copied): near-black backgrounds, an emerald-green primary accent, selection
states shown as a tinted border + fill rather than a solid fill, toggle
options wrapped in color-coded cards, big bold numerals, uppercase
letter-spaced micro-labels for section headers, full-width pill CTA
buttons. None of 38-0's actual code, text, or assets were reproduced —
these are our own tokens and components inspired by that aesthetic.

**Verified:** `tsc --noEmit`, `eslint .`, and `next build` all clean.
Screenshotted `/login` and `/signup` against a production build (Playwright,
installed temporarily and removed afterward — not a project dependency) to
confirm the retheme actually renders; dashboard/expenses/etc. couldn't be
screenshotted since they need a real signed-in session.

---

### 2026-08-20 — Security hardening: TOTP MFA + headers (part of PR #2)

**What:** Two-factor auth (TOTP) via Supabase's native MFA API — enrollment
UI in Settings, a `/login/mfa` challenge screen, and — the part that
actually matters — enforcement in `src/lib/supabase/proxy-helper.ts`. A
session that has a verified authenticator factor but hasn't completed its
challenge this session gets redirected to the MFA screen *before* it can
reach any protected route, not just prompted for it optimistically. Also
added strict security headers (`next.config.ts`): CSP with no
inline/eval scripts, HSTS, X-Frame-Options, Referrer-Policy, a locked-down
Permissions-Policy.

**Why:** the user was explicit that this app will hold real financial data
and they didn't want to worry about it being compromised. A password alone
being sufficient to reach the data — even with MFA "available" but only
checked at the login form — would be security theater; the proxy-level
check is what makes it real. `script-src` stays strict (`'self'`, no
`unsafe-inline`/`unsafe-eval` in production) since that's the actual XSS
attack surface; `style-src` allows `unsafe-inline` because a couple of
dynamic inline styles (progress bar widths) need it and CSS-only injection
risk is far lower than script injection — a deliberate, documented
trade-off, not an oversight.

**Also in this pass:** signup locks itself after the first account is
created (checked via the admin/service-role client, since an anonymous
signup attempt has no session to check `profiles` under RLS) — the user
wanted exactly one account, theirs.

**Process note:** at the user's request, commit messages from this point on
stopped including the `Claude-Session:` link footer (kept `Co-Authored-By`
for attribution). Earlier commits still have it; not rewritten since that
would mean force-pushing already-pushed history.

---

### 2026-08-20 — Initial build: budget app replacing the old PHP repo (PR #2, merged)

**What:** The repo previously held an unrelated PHP food-ordering site
("24x7 Foodies") from a school project — wiped entirely and replaced with a
personal budget-tracking PWA, per the user's request to "empty this repo
and make it my own."

Stack chosen after asking the user to pick between concrete tradeoffs
(recorded here since the *reasons* matter more than the choice): **Next.js
16 (App Router, TypeScript, Tailwind) as a PWA**, deployed on **Vercel**;
**Supabase** for Postgres + Auth + row-level security; **Resend** for email;
optional **Claude** for AI narration. All free-tier-capable, matching the
"no hosting cost, or cheap" requirement. PWA over React Native: one
codebase, installable from the browser, no app-store account needed.
Manual entry + CSV import over live bank sync (Plaid): avoids a recurring
third-party cost and a second party holding bank credentials, at the cost
of needing to paste in a CSV export by hand.

**Core design decision — the daily "safe to spend" number is deterministic,
not AI-guessed** (`src/lib/budget-engine.ts`): remaining monthly budget,
minus money already reserved for upcoming recurring bills and this month's
required goal contributions, divided by days left in the month. The
optional AI coach only narrates these already-computed numbers in plain
language and is explicitly instructed never to invent or recompute a
figure. This was a deliberate choice: a budgeting number a user might act
on financially needs to be a formula they (or anyone) can audit, not
something an LLM produced.

**Everything else in this pass:** Supabase schema + RLS on every table
(`supabase/migrations/0001_init.sql`); expense CRUD; CSV import (generic
bank-statement format, client-side parsing, only structured rows sent to
the server); budgets (overall + per-category, monthly) and recurring bills;
goals with a contribution history; a dashboard tying it all together;
Resend + Vercel Cron daily email alerts (overspend pace, low allowance,
goals at risk) with `alert_log`-based dedupe so the cron can't double-send;
PWA manifest/service-worker/icons (icons generated at request time via
`next/og` rather than checked-in binary assets); full README with setup
steps and a security-notes section.

**Note on Next.js 16:** at the time of this build, Next 16 (not 15) was the
actual current stable release — a real breaking-changes jump from what
training data would expect (`middleware.ts` → `proxy.ts`, fully-async
`params`/`cookies()`/`headers()`, Turbopack on by default). Confirmed via
the framework's own bundled agent docs
(`node_modules/next/dist/docs/`) before writing any App Router code, per
the note Next itself leaves in `AGENTS.md`.
