# Task 03: The Form, Attacked from Both Sides (`task-03-client-validation/`)

## What This Task Was
Built the unified customer authentication flow (`/auth`) in Fresh Fold Laundry, audited and fixed its accessibility for keyboard and screen-reader users, tested real validation rules derived from the shop's docket workflow, and proved directly via `curl` that client-side validation provides zero backend security.

---

## What We Built
- **Single-Page Auth Architecture (`src/app/auth/`):** Collapsed three initial routes (`/signup`, `/login`, `/reset-password` — **6** total pages in `evidence/01-page-count-before.txt`) into a single `/auth?mode=signup|login|reset` route (**4** total pages in `evidence/02-page-count-after.txt`) switching modes via React state and `window.history.replaceState` with zero new server requests (`evidence/04-form-switch-logs.txt`).
- **Shop-Derived Client Validation (`src/app/auth/AuthForm.tsx`):**
  - Inline blur errors (non-generic receipt-book copy) across `fullName`, `email`, `phone`, `docketNumber`, `claimPin`, and `password`.
  - Real-time email format check scoped strictly to **Sign up**; submit-only check on **Log in** and **Reset password**.
  - `<input type="text" inputMode="numeric">` replacing `<input type="number">` on `docketNumber` to eliminate leading-zero cursor friction (`evidence/09` vs `evidence/10`).
  - Passphrase-first 10-character minimum (`password`) with a show/hide visibility toggle and typing-triggered hint (`#password-hint`).
- **Accessibility Fixes Verified via Chrome AXTree:** Paired `--color-error` with SVG `CautionIcon`, added `<label htmlFor="termsAccepted">` + `aria-required="true"` + `required`, switched hidden submit button (`evidence/13`) to always-visible `aria-disabled` with `role="alert"` blocker explanation (`evidence/14`), and linked all errors/hints with `aria-invalid` and `aria-describedby`.
- **SQLite Registration Endpoint (`src/app/api/auth/register/route.ts`):** Deliberately unvalidated at this stage (`customer_accounts` table in `src/lib/db.ts`) to expose the client-vs-server gap.

---

## What We Decided
- **Zero hint on Counter claim PIN (`claimPin`):** Removed placeholder/length hints before blur so attackers cannot map the 5–8 digit PIN keyspace (`docs/enumeration.md`).
- **Plain-language record-keeping notice (`termsAccepted`):** Adapted NDPA-aligned record-keeping consent without fabricated statutory legalese (`docs/terms-note.md`).
- **Documented who every rule wrongly blocks (`docs/validation-rules.md`):** Explicitly recorded real customers blocked by each check (mononymous names, `+234` / foreign WhatsApp numbers, pre-100 legacy dockets, `00000`-style PINs).
- **Deterministic rollback (`docs/rollback.md`):** Rolled back regret commit `1c0d1c5` via explicit `git reset --hard 2f67f2e` (`evidence/17-commit-list-and-rollback.txt`).

---

## What We Got Wrong / Unresolved Defects
1. **Direct `curl` bypass succeeded completely (`docs/client-side-is-not-security.md`):** Posting `{"fullName":"a","email":"not-an-email","phone":"1","docketNumber":0,"claimPin":"1","password":"1","termsAccepted":false}` directly to `POST /api/auth/register` bypassed all 8 client rules and returned **`HTTP 201 Created`** (`accountId: 4`).
2. **Browser UI bypasses (`evidence/15-form-attack-results.txt`):** Password `"a         "` passed 10-char check, `"a@b"` passed `/^\S+@\S+$/`, and untrimmed `"amaka@example.com   "` plus a 240-char name/15-digit docket created `Account #3`.
3. **Full defect breakdown** in [`docs/defects.md`](docs/defects.md) (`route.ts:9-36` plaintext credentials & zero server checks, `AuthForm.tsx:146-163` unhandled network failure on flaky Android data, `AuthForm.tsx:400-416` missing blur-level inline error binding on terms checkbox). Fixed in Task 04.
