# Single-Page Authentication Rationale (`docs/spa-rationale.md`)

*(Evidence: `01-page-count-before.txt`, `02-page-count-after.txt`, `03-url-states.png`, `04-form-switch-logs.txt`.)*

---

## 1. What the User Experience Was Before
Previously, Fresh Fold Laundry exposed three separate route files: `/signup`, `/login`, and `/reset-password` (6 pages total in `01-page-count-before.txt`). On Amaka Obi’s entry-level Android phone over a flaky 4G mobile data bundle, tapping `"Already registered? Log in"` or `"Forgot password?"` triggered a full route transition, fetching a new route payload over the network, re-running layout hydration, and wiping any email address she had already typed. If her signal dropped between routes, she landed on a blank loading error screen.

---

## 2. Why Instant Form Switching Matters
Collapsing `/signup`, `/login`, and `/reset-password` into a single conditional view at `/auth?mode=signup|login|reset` (`02-page-count-after.txt` — 4 total routes) updates the URL via `window.history.replaceState` without triggering a server request (`04-form-switch-logs.txt` proves **zero** HTTP `GET` requests during tab switches):
- **Zero data cost on switch:** Vital when Amaka turns her small weekly data bundle off/on between checks.
- **Preserved local state:** Her typed email address stays intact when jumping from `Sign up` to `Log in` or `Reset password`.
- **Bookmarkable & back-button safe:** Query parameters (`?mode=login`, `?mode=reset`) remain deep-linkable from notification emails.

---

## 3. One Case Where Separate Pages Would Be the Better Choice
Single-page conditional rendering is **the wrong architecture** when a flow requires **independent SEO landing pages, strict bundle isolation, or distinct security boundaries**—for example, a public marketing signup funnel paired with an **administrative staff portal** or a **high-compliance KYC onboarding wizard** containing heavy document-upload libraries.

Loading heavy admin dashboards, PDF scanners, or multi-step legal disclosures into one shared client bundle inflates initial JavaScript download size for ordinary customers (hurting Amaka's low-storage phone), leaks privileged route UI code to unauthenticated browsers, and prevents search engines from indexing standalone marketing entry points cleanly.
