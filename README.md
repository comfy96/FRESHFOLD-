# Fresh Fold Laundry

*(Repository Layout: Single monorepo containing all five sequential assessment folders `task-01-*` through `task-05-*` alongside the active Next.js application under `src/`.)*

---

## 1. What this is
Fresh Fold Laundry is a lightweight customer record portal that gives Nigerian neighbourhood laundry customers (like Amaka Obi on an entry-level Android phone with intermittent mobile data) verified, dated visibility into their own item counts, washing status, and payment records—and never anyone else's.

---

## 2. Status
- **Finished (Task 01 Design System):** Complete Figma token exports (`#007B71` teal pinned at Primary 40, Light & Dark mode collections), 15-style `Plus Jakarta Sans` type scale (`57/80`, `-0.25px`), brand-tinted shadow tokens, Node.js token-to-CSS compiler (`task-01-design-system/scripts/build-tokens.js`), static order screen (`src/index.html`), and all Task 01 docs and browser captures (`01`–`12`).
- **Finished (Task 02 Code, Diagnostics & Docs):** Phased Next.js 15 + TypeScript scaffold without Tailwind, SQLite persistence (`POST /api/pickup-requests` returning HTTP `201`, `/pickup`, `/orders`), cold/warm load benchmarks (`1,414 ms` $\rightarrow$ `13 ms`), 3 server breakages and recoveries (`05`–`10`), false-success investigation (`11`–`13`), hand-drawn working tree diagram (`14-working-tree-drawing.jpg`), Git branch graph proof (`15-git-log-graph.txt`), information design (`16`–`20`), and written docs (`model-choices.md`, `performance-note.md`, `false-success.md`, `working-tree.md`, `information-design.md`, `defects.md`, `interview-answers.md`).
- **Finished (Task 03 SPA Form, Validation, Accessibility & Docs):** Collapsed auth routes (`/signup`, `/login`, `/reset-password` $\rightarrow$ `/auth?mode=signup|login|reset`, 6 pages $\rightarrow$ 4 pages), implemented shop-derived client validation + `<input type="text" inputMode="numeric">` for dockets, fixed 4 accessibility issues verified via Chrome AXTree (`CautionIcon`, `aria-disabled` + explanation alert, `<label htmlFor>`, `aria-describedby`), proved client-side rules provide zero security via direct `curl` `HTTP 201` bypass (`evidence/16`), executed deterministic rollback `git reset --hard 2f67f2e`, and wrote all Task 03 docs (`spa-rationale.md`, `field-justification.md`, `validation-rules.md`, `terms-note.md`, `enumeration.md`, `accessibility-audit.md`, `client-side-is-not-security.md`, `rollback.md`, `defects.md`, `interview-answers.md`).
- **Finished (Task 04 Server-Side Security, Migrations & Verification):** 7-table Prisma relational schema (`customers`, `sessions`, `pickup_requests`, `payments`, `payment_attempts`, `verification_codes`, `ledger_chunks`), forward-only migration discipline (`init`, `add_optional_window`, `make_window_required`), deliberate breakage and drift recovery (`04`–`06`), memory-hard Argon2id hashing (`85.9 ms/hash` vs SHA-256 `0.00045 ms/hash`, `07`–`08`), Zod schema boundary validation rejecting Task 3 direct curl attack with `HTTP 400` (`12`), email lowercasing and password whitespace trimming (`09`–`10`), 5 req/15 min IP rate limiting and defeat analysis (`13`–`14`), HIBP k-anonymity breached-password rejection (`15`), SMTP delivery failure and recovery (`16`–`17`), background email job timing (`18`), single-use CSPRNG 6-digit OTP verification flow with expired/wrong/reused failure tests (`19`–`22`), tokenized email template (`23`), and all 10 docs + 19 interview answers.
- **Pending Optional/User Actions (Tasks 02–04):**
  - `task-02-repository-and-scaffold/docs/readme-test.md`: Complete live onboarding test with an unfamiliar human tester and paste their verbatim quote.
  - GitHub Push & PR URLs: Push branches to `origin` interactively and record PR links below.
  - *(Optional bonus)* Record VoiceOver / walkthrough audio and screen video clips.
- **Not started:** `task-05-sessions-compliance-defence/`.

*(Task 02 Pull Request URL: `<pending GitHub PR creation for feat/information-design -> main>`)*

---

## 3. The stack, with reasons
- **Next.js 15 (App Router) + TypeScript:** Chosen over a static HTML live server or single-file Express script because it provides dynamic server API routes (`/api/pickup-requests`), server-side database rendering (`/orders`), and built-in `<head>` metadata templates from one cohesive codebase.
- **CSS Modules + Semantic CSS Variables (`src/styles/variables.css`, zero Tailwind):** Chosen over Tailwind CSS to enforce strict two-tier Figma token consumption (`--color-*`, `--type-*`, `--shadow-*`) and avoid utility-class bloat on Amaka Obi's low-cost Android device.
- **Node.js v26.13.0 Built-in SQLite (`node:sqlite` `DatabaseSync`):** Chosen over heavier Postgres/Docker setups in Task 02 so any maintainer can clone, run `npm install`, and inspect real persisted rows with zero external database daemons.

---

## 4. Getting started
**Prerequisite:** Node.js **v22.5+** (tested on **v26.13.0**; required for built-in `node:sqlite`). Verify with `node -v`.

Run these exact commands in order from a fresh clone:

```bash
git clone https://github.com/comfy96/FRESHFOLD-.git
cd FRESHFOLD-
npm install
cp .env.example .env
```

Open `.env` and set `DATABASE_URL` to a local SQLite path (for example `./freshfold.db`), then start the development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your browser. Visit `/auth?mode=signup` (tabs for `Sign up`, `Log in`, `Reset password`) to test customer registration, `/pickup` to record a laundry pickup request, and `/orders` to view logged shop records.

---

## 5. Environment variables
- `DATABASE_URL`: File path to the local SQLite database read by `src/lib/db.ts` (never commit `.env` or set values here).
- `NEXT_PUBLIC_SITE_URL` *(optional)*: Base origin URL used by Next.js `metadataBase` in `src/app/layout.tsx` when resolving Open Graph preview images (defaults locally to `http://localhost:3000`).

---

## 6. What this deliberately does not do
- **No AI chatbot interface:** Customers anxious about missing garments or unrecorded transfers distrust opaque bots; the portal shows dated ledger records ("Our records show") instead.
- **No external Redis cluster for rate limiting yet:** In-process counters protect the single-node shop server without external server overhead or network fees (`docs/not-implemented.md`).
- **No SMS or TOTP 2FA yet:** Costly per-SMS gateway charges and authenticator app lockouts punish non-technical Android users; email OTP plus counter PINs matches the threat model.
- **No third-party interactive CAPTCHA:** Bloats page payloads and breaks offline slow-2G progressive enhancement; server validation and k-anonymity filter abuse cleanly.

---

## 7. Known defects
1. **Unauthenticated `/orders` route exposes all customer rows (`src/app/orders/page.tsx:24-26`, `src/app/api/pickup-requests/route.ts:7-9`):** Returns recent `pickup_requests` rows without session authentication (addressed in Task 05 session middleware).
2. **In-memory rate limiting store wipes on process restart (`src/lib/security/rate-limit.ts:16-25`):** Restarts or cluster scaling partitions counter buckets.
3. **Missing account-level lockout on failed sign-ins (`src/app/api/auth/login/route.ts:50-75`):** Rate limits protect IPs but do not lock customer accounts during distributed proxy rotation.
4. **Ephemeral in-process email queue (`src/lib/email/mailer.ts:50-65`):** Unhandled server crashes during background email dispatch lose unsent verification notices without retry persistence.
5. **Minimal offline breach corpus (`src/lib/security/breach-check.ts:9-18`):** Falls back to 8 hardcoded passwords when outbound network access to HIBP is unavailable.
6. **Unresolved Task 01 Figma defects (`task-01-design-system/docs/defects.md`):** Light Mode `Surface_Container_Lowest` maps to `#2B3230` (`1.31:1` contrast, avoided in UI), `error 60–99` export as `#FFFFFF`, and `Plus Jakarta Sans` lacks bundled offline `.woff2` files.
