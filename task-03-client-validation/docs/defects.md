# Task 03 Code Defects (`docs/defects.md`)

Real defects verified in the current `feat/task-03-client-validation` codebase, citing exact file paths, line numbers, and production cost.

---

## 1. Unvalidated Server Endpoint Stores Plaintext Passwords & Counter PINs
- **Location:** `src/app/api/auth/register/route.ts:9-36`
- **Defect:** `POST /api/auth/register` destructures raw JSON directly into a SQLite `INSERT INTO customer_accounts` statement with zero schema validation, zero trimming/lowercasing, no uniqueness error mapping, and plaintext storage of both `password` and `claim_pin` (plus accepting `termsAccepted: false`, proven in `evidence/16-direct-request-command-and-response.txt` returning `HTTP 201 Created`, `accountId: 4`).
- **Production cost:** Any script using `curl` bypasses the UI to inject junk accounts and unconsented records (`termsAccepted: false`), and any SQLite file leak or read-only breach immediately exposes every customer's reusable password and shop counter pickup PIN in plaintext.

---

## 2. Whitespace-Padded Passwords, Loose Email Regex, and Untrimmed Submission
- **Location:** `src/app/auth/AuthForm.tsx:69, 81, 108, 119, 151`
- **Defect:** `validateField` checks `val.length < 10` on `password` (`line 81`) rather than trimmed length (`val.trim().length < 10`), and uses `/^\S+@\S+$/` (`lines 69, 108, 119`) without requiring a domain dot. In `handleSubmit` (`line 151`), `email` is sent raw (`"amaka@example.com   "` in `evidence/15-form-attack-results.txt` created `Account #3`) rather than trimmed/lowercased.
- **Production cost:** A customer or bot can submit `"a         "` (1 character + 9 spaces) as a 10-character password, invalid domains like `"a@b"` slip through client checks, and trailing spaces copied onto an email address prevent Amaka from logging back in on another device where she types her clean address.

---

## 3. Uncapped Field Lengths and Unhandled `fetch` / Non-2xx Failure in `AuthForm`
- **Location:** `src/app/auth/AuthForm.tsx:146-163, 225-235, 305-316`
- **Defect:** `fullName` (`lines 225-235`) and `docketNumber` (`lines 305-316`) have no upper-bound length check (a 240-character name and 15-digit docket passed cleanly in `evidence/15-form-attack-results.txt`), and `handleSubmit` (`lines 146-163`) calls `await fetch(...)` and `await res.json()` inside an unguarded async block that only branches on `if (res.ok)` with no `else` banner and no `try/catch`.
- **Production cost:** When Amaka's entry-level Android drops cellular data mid-POST or the API returns a non-JSON `500`, the browser rejects an unhandled promise and leaves the form frozen with zero explanation—making her resubmit repeatedly or abandon signup.

---

## 4. Terms Checkbox Has No Dedicated Inline Error Binding on Blur
- **Location:** `src/app/auth/AuthForm.tsx:400-416`
- **Defect:** Unlike the six text inputs, `termsAccepted` has `aria-required="true"` (`line 405`) but does not set `aria-invalid` or link an inline `#terms-error` via `aria-describedby`; users only see `"Accept the Fresh Fold Laundry record-keeping terms before creating your account."` inside `#statusExplain` (`lines 136-139, 434-438`) once they try clicking `Create account`.
- **Production cost:** Screen-reader users tabbing straight past the unchecked box do not receive immediate inline error association until they traverse down to the submit button and trigger it.
