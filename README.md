# Fresh Fold Laundry

*(Repository Layout: Single monorepo containing all five sequential assessment folders `task-01-*` through `task-05-*` alongside the active Next.js application under `src/`.)*

---

## 1. What this is
Fresh Fold Laundry is a lightweight customer record portal that gives Nigerian neighbourhood laundry customers (like Amaka Obi on an entry-level Android phone with intermittent mobile data) verified, dated visibility into their own item counts, washing status, and payment records—and never anyone else's.

---

## 2. Status
- **Finished (Task 01 Design System):** Complete Figma token exports (`#007B71` teal pinned at Primary 40, Light & Dark mode collections), 15-style `Plus Jakarta Sans` type scale (`57/80`, `-0.25px`), brand-tinted shadow tokens, Node.js token-to-CSS compiler (`task-01-design-system/scripts/build-tokens.js`), static order screen (`src/index.html`), and all Task 01 docs and browser captures (`01`–`12`).
- **Finished (Task 02 Code, Diagnostics & Docs):** Phased Next.js 15 + TypeScript scaffold without Tailwind, SQLite persistence (`POST /api/pickup-requests` returning HTTP `201`, `/pickup`, `/orders`), cold/warm load benchmarks (`1,414 ms` $\rightarrow$ `13 ms`), 3 server breakages and recoveries (`05`–`10`), false-success investigation (`11`–`13`), hand-drawn working tree diagram (`14-working-tree-drawing.jpg`), information design (`16`–`20`), and written docs (`model-choices.md`, `performance-note.md`, `false-success.md`, `working-tree.md`, `information-design.md`, `defects.md`, `interview-answers.md`).
- **Pending Human Actions (Task 02):**
  - `task-02-repository-and-scaffold/docs/readme-test.md`: Verbatim onboarding test run by an unfamiliar person.
  - `task-02-repository-and-scaffold/evidence/15-git-log-graph.txt` & PR URL: Push `feat/information-design` to GitHub, open & merge PR against `main`, then create & delete a rejected second branch.
- **Not started:** `task-03-client-validation/`, `task-04-server-security/`, `task-05-sessions-compliance-defence/`.

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

Open `http://localhost:3000` in your browser. Visit `/pickup` to record a laundry pickup request and `/orders` to view logged shop records.

---

## 5. Environment variables
- `DATABASE_URL`: File path to the local SQLite database read by `src/lib/db.ts` (never commit `.env` or set values here).
- `NEXT_PUBLIC_SITE_URL` *(optional)*: Base origin URL used by Next.js `metadataBase` in `src/app/layout.tsx` when resolving Open Graph preview images (defaults locally to `http://localhost:3000`).

---

## 6. What this deliberately does not do
- **No AI chatbot interface:** Customers anxious about missing garments or unrecorded transfers distrust opaque bots; the portal shows dated ledger records ("Our records show") instead.
- **No login/session gating or user scoping yet:** Authentication and single-customer row isolation are deliberately deferred until Tasks 03–05 so Task 02 stays focused on scaffolding, persistence verification, and diagnostics.
- **No schema migration runner yet:** `node:sqlite` creates the initial `pickup_requests` table on connection; full forward-only ORM migrations are introduced in Task 04.

---

## 7. Known defects
1. **Unauthenticated `/orders` route exposes all customer rows (`src/app/orders/page.tsx:24-26`, `src/app/api/pickup-requests/route.ts:7-9`):** Returns the 10–20 most recent `pickup_requests` rows without session authentication or user ownership filtering.
2. **DDL `CREATE TABLE IF NOT EXISTS` inside request path (`src/lib/db.ts:24-35`):** Opens SQLite and executes schema creation on every API call rather than using versioned migrations.
3. **Minimal API validation & raw 500 error exposure (`src/app/api/pickup-requests/route.ts:28-34`, `54`):** Lacks Zod schema validation and leaks raw database exception messages in `500` JSON responses.
4. **No offline form draft queueing (`src/app/pickup/PickupForm.tsx:78-85`):** If Amaka's cellular signal drops during `fetch`, entered notes are not saved locally for retry.
5. **Unresolved Task 01 Figma defects (`task-01-design-system/docs/defects.md`):** Light Mode `Surface_Container_Lowest` maps to `#2B3230` (`1.31:1` contrast, avoided in UI), `error 60–99` export as `#FFFFFF`, and `Plus Jakarta Sans` lacks bundled offline `.woff2` files.
