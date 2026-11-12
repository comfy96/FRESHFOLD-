# Task 02: Scaffold It, Ship the Repository, Then Find Out What Is Actually Running

**Business:** Fresh Fold Laundry

---

## 1. What This Task Was
Taking Fresh Fold Laundry from static design-system files to a running Next.js + TypeScript application without surrendering control to the AI agent, verifying real SQLite database persistence (`HTTP 201`) against silent UI false-success illusions, breaking and recovering the dev server three ways, and applying information design to `<head>` and `<body>`.

## 2. What Was Built
- **Controlled Phased Scaffold (`AGENT.md`, `.agent/rules/`, `src/app/`):**
  - Human-authored phased prompt (`docs/scaffold-prompt.md`) halted the agent at Phase 1 (`evidence/01-agent-plan.txt`) to resolve 5 file disagreements before scaffolding a minimal `100dvh` Next.js 15 shell (`evidence/02-files-created.txt`).
- **Model Comparison (`docs/model-choices.md`):**
  - Used Antigravity high-reasoning for architecture/DB and `flash_lite` for `src/lib/formatRecordDate.ts` (caught `flash_lite` skipping Nigerian `WAT` `UTC+1` timezone conversion and day padding).
- **Diagnostics & Real Persistence (`src/lib/db.ts`, `/api/pickup-requests`, `/pickup`, `/orders`):**
  - Measured `1,414 ms` cold load vs `13 ms` warm reload (`evidence/04-first-load.txt`, `docs/performance-note.md`).
  - Induced and recovered from nested-folder error (`05`–`06`), port `3000` conflict with real local `PID 56412` (`07`–`08`), and `/orders` `404` (`09`–`10`).
  - Verified two SQLite writes minutes apart (`10:46:25Z` and `10:53:03Z`, `HTTP 201 Created` in `11-write-succeeded-logs.txt` and `12-database-rows.png`), then broke `DATABASE_URL` to prove false-success UX (`13-write-failed-logs.txt`, `docs/false-success.md`) before fixing `PickupForm.tsx`.
- **Information Design (`feat/information-design` branch, `16`–`20`):**
  - Dynamic route `<title>` template, 7-word tagline, home-only SEO (`robots: index, follow` vs `noindex` on `/orders`), custom `icon.svg`, Open Graph `og-freshfold.svg`, collapsed single CTA button sized in `rem` with Task 01 `Label Large`, `max-width: 12ch` heading shape, and `clamp()` responsive typography across `320px`, `768px`, and `1280px`.

## 3. What We Got Wrong (`docs/defects.md`)
1. Unauthenticated `/orders` and `/api/pickup-requests` currently expose all customers' pickup rows (`src/app/orders/page.tsx:24-26`).
2. `getDb()` executes `CREATE TABLE IF NOT EXISTS` inside HTTP handlers instead of migrations (`src/lib/db.ts:24-35`).
3. Naive truthiness validation and raw `500` error string exposure in `POST /api/pickup-requests` (`src/app/api/pickup-requests/route.ts:28-34`, `54`).
4. No offline form draft persistence on `PickupForm.tsx:78-85` when signal drops.

## 4. Remaining Human-Only Evidence
- `docs/readme-test.md`: Record verbatim friction from a live unfamiliar person following `README.md`.
- GitHub PR URL in `README.md`: Push `main` and `feat/information-design` to `origin` and add the GitHub Pull Request link. (`15-git-log-graph.txt` is already captured locally with `--no-ff` merge + discarded branch proof.)

