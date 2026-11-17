# Task 05: Sessions, Lawful Account Deletion & The Full Defence (`task-05-sessions-compliance-defence/`)

**Business:** Fresh Fold Laundry  
**Domain:** Nigerian Neighbourhood Laundry Portal & Ledger  
**Branch:** `feat/task-05-sessions-compliance-defence`  
**Status:** **Complete & Fully Verified**  

---

## 1. What This Task Was

Task 05 delivered the final production architecture for Fresh Fold Laundry: managing cryptographically secure sessions, resolving the statutory conflict between African privacy rights (NDPA 2023 Section 34) and mandatory corporate tax record retention (CAMA 2020 Section 374), eliminating the logout edge case on flaky mobile data, conducting primary field research with a real Nigerian laundry operator, publishing an engineering deep dive, and compiling the full 22-question viva defence.

---

## 2. What We Built

- **Cryptographic Session Management (`src/lib/security/session.ts`):**
  - High-entropy 256-bit random tokens (`crypto.randomBytes(32)`).
  - One-way **SHA-256 token hashing** (`token_hash`) for database storage. Raw session IDs are never saved in SQLite.
  - Strict cookie flags: `HttpOnly`, `SameSite=Lax`, `Path=/`, and 7-day rolling expiry (`evidence/02`).
  - Concurrent multi-session support: two distinct logins issue independent tokens (`evidence/01`).
- **Gating Architecture (`docs/gating.md`):**
  - Shipped **Soft Gating** in production to prevent physical counter friction for Amaka Obi on flaky 2G mobile data (`evidence/03`).
  - Implemented **Hard Gating** on the same route (`?gating=hard`) to document and capture the strict alternative (`evidence/04`).
- **Account Enumeration Shield & Timing Protection (`src/app/api/auth/login/route.ts`):**
  - Unified generic error responses (`HTTP 401 {"error":"Incorrect email or password."}`).
  - Padded execution timing via `DUMMY_ARGON2_HASH` so non-existent emails compute a full 64 MiB Argon2id hash (~90–130 ms), eliminating timing attacks (`evidence/05`).
- **Logout Edge Case & RBAC Protection (`src/app/orders/`, `src/app/admin/`):**
  - Tested multi-user single-browser session isolation and cache protection (`evidence/06`).
  - Proved database session row presence during login (`evidence/07`) and permanent deletion upon logout (`evidence/08`).
  - Trapped network drop failure during logout, preventing UI lies (`evidence/09`) and proving the zero-lie defensive fix with retry controls (`evidence/10`).
  - Enforced Role-Based Access Control on `/admin`, refusing ordinary customer sessions with `403 Forbidden` (`evidence/16`).
- **Global Multi-Device Session Invalidation (`src/app/api/auth/reset/confirm/route.ts`):**
  - Proved password resets synchronously destroy all active sessions across all devices via `revokeAllCustomerSessions(customerId)` (`evidence/11`).
- **Lawful Account Deletion Pipeline (`src/lib/deletion/job.ts`):**
  - Implemented the 4-stage lifecycle: Soft Delete $\rightarrow$ 7-day Grace Period $\rightarrow$ Idempotent Scheduled Purge $\rightarrow$ Tax Retention.
  - Immediate lockout on deletion request (`evidence/12`).
  - Run 1 of purge job anonymized customer PII while strictly preserving financial payment transactions under CAMA 2020 (`evidence/13`).
  - Run 2 verified strict idempotency: 0 accounts processed, zero errors, matching start/finish logs (`evidence/14`).
- **Client-Side State Management (`docs/state-management.md`):**
  - Maintained email persistence across auth mode transitions using native React state and URL search params without Redux/Zustand overhead (`evidence/15`).
- **Primary Research & Engineering Viva:**
  - Interviewed Chinedu Okafor of CleanEdge Laundry in Surulere, Lagos (`docs/interview-with-owner.md`).
  - Authoritative 7-chapter technical handbook (`docs/handbook.md`).
  - Exhaustive 8-item technical self-awareness audit (`docs/what-i-do-not-know.md`).
  - Published technical article (`evidence/17`).
  - Answered all 22 interview defence questions under 200 words each (`docs/interview-answers.md`).

---

## 3. Evidence Index (`task-05-sessions-compliance-defence/evidence/`)

| File | Type | Description |
| :--- | :--- | :--- |
| [`01-two-session-ids.txt`](evidence/01-two-session-ids.txt) | Terminal Log | Two distinct logins returning separate 256-bit tokens and SHA-256 database hash verification. |
| [`02-cookie-flags.png`](evidence/02-cookie-flags.png) | Browser Capture | Chrome DevTools Application tab showing `HttpOnly`, `SameSite=Lax`, and database isolation. |
| [`03-soft-gating-flow.png`](evidence/03-soft-gating-flow.png) | Browser Capture | Amaka Obi authenticated with unverified banner alongside active laundry ledger. |
| [`04-hard-gating-flow.png`](evidence/04-hard-gating-flow.png) | Browser Capture | Hard gating blocking screen on `/orders?gating=hard` suppressing ledger access. |
| [`05-generic-errors-both-cases.png`](evidence/05-generic-errors-both-cases.png) | Screenshot | Identical `401` errors and matching ~100 ms execution timing for nonexistent vs wrong password. |
| [`06-two-users-one-browser.txt`](evidence/06-two-users-one-browser.txt) | Terminal Log | Multi-user cookie overwrite, scoped queries, and `no-store` cache protection proof. |
| [`07-session-row-present.png`](evidence/07-session-row-present.png) | Terminal Capture | Active session row present in SQLite `sessions` table while logged in. |
| [`08-session-row-deleted.png`](evidence/08-session-row-deleted.png) | Terminal Capture | SQLite `sessions` table showing 0 rows returned after `POST /api/auth/logout`. |
| [`09-logout-network-failure.txt`](evidence/09-logout-network-failure.txt) | Terminal Log | Simulation of network drop during logout exposing naive client-side illusions. |
| [`10-logout-edge-case-fixed.txt`](evidence/10-logout-edge-case-fixed.txt) | Terminal Log | Defensive zero-lie architecture catching network drop, offering retry, and confirming revocation. |
| [`11-reset-kills-other-session.png`](evidence/11-reset-kills-other-session.png) | Browser Capture | Password reset on Device 2 instantly revoking Device 1's session (`HTTP 307` redirect). |
| [`12-deletion-request-locks-account.png`](evidence/12-deletion-request-locks-account.png) | Screenshot | Account deletion request setting `deleted_at`, destroying sessions, and locking login. |
| [`13-scheduled-job-run-one.txt`](evidence/13-scheduled-job-run-one.txt) | Terminal Log | Scheduled purge job run 1 processing accounts past grace period and preserving tax payments. |
| [`14-scheduled-job-run-two.txt`](evidence/14-scheduled-job-run-two.txt) | Terminal Log | Scheduled purge job run 2 proving idempotency (0 accounts processed, clean exit). |
| [`15-state-management-working.png`](evidence/15-state-management-working.png) | Browser Capture | Customer email seamlessly preserved across mode transition without Redux/Zustand. |
| [`16-admin-route-refused.png`](evidence/16-admin-route-refused.png) | Browser Capture | Ordinary customer session accessing `/admin` receiving `403 Forbidden` staff refusal. |
| [`17-published-article-screenshot.png`](evidence/17-published-article-screenshot.png) | Screenshot | High-resolution capture of published technical deep-dive article. |

---

## 4. Documentation Index (`task-05-sessions-compliance-defence/docs/`)

- [`docs/sessions.md`](docs/sessions.md): Cryptographic session architecture, SHA-256 token hashing, and cookie flags.
- [`docs/gating.md`](docs/gating.md): Operational trade-offs between Soft Gating and Hard Gating for Nigerian retail.
- [`docs/state-management.md`](docs/state-management.md): Native React state vs Redux/Zustand on budget mobile hardware.
- [`docs/retention-matrix.md`](docs/retention-matrix.md): Exhaustive column-by-column retention matrix reconciling NDPA with CAMA tax law.
- [`docs/interview-with-owner.md`](docs/interview-with-owner.md): Primary research with Chinedu Okafor of CleanEdge Laundry.
- [`docs/handbook.md`](docs/handbook.md): Seven-chapter technical handbook with real commit history mistakes.
- [`docs/what-i-do-not-know.md`](docs/what-i-do-not-know.md): Self-awareness audit covering 8 genuine technical blind spots.
- [`docs/defects.md`](docs/defects.md): Known defects, root causes, and production remediations.
- [`docs/interview-answers.md`](docs/interview-answers.md): All 22 viva defence questions answered under 200 words each.
- Root [`privacy.md`](../privacy.md): Plain-language, legalistic-jargon-free customer privacy notice.
- Root [`privacy-draft-with-broken-promise.md`](../privacy-draft-with-broken-promise.md): Critique of naive "instant zero-second" deletion marketing promises.
