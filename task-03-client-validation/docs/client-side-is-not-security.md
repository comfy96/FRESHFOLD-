# Client-Side Validation Is Not Security (`docs/client-side-is-not-security.md`)

*(Step 8: Attack your own form, then skip it entirely.)*

---

## 1. The Direct Request Sent and What the Server Did

Bypassing the `/auth` React form completely, the following `curl` request was sent directly to the registration endpoint (`task-03-client-validation/evidence/16-direct-request-command-and-response.txt`):

```bash
curl -i -s -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"a","email":"not-an-email","phone":"1","docketNumber":0,"claimPin":"1","password":"1","termsAccepted":false}'
```

**Actual server response:**

```http
HTTP/1.1 201 Created
content-type: application/json

{"ok":true,"accountId":4,"received":{"fullName":"a","email":"not-an-email","phone":"1","docketNumber":0,"claimPin":"1","password":"1","termsAccepted":false}}
```

The server **accepted every invalid field without hesitation**, inserted the garbage payload as row `id = 4` in SQLite table `customer_accounts`, and returned **`HTTP 201 Created`**. Even `termsAccepted: false` and a 1-character password (`"1"`) were written directly to persistent storage (`src/app/api/auth/register/route.ts:9-35`).

---

## 2. Which of the Eight Client-Side Rules Were Enforced on That Request

**Zero out of eight.** Specifically:

| Client-Side Rule (`src/app/auth/AuthForm.tsx`) | Sent in Direct `curl` Payload | Enforced by `/api/auth/register`? |
|---|---|---|
| 1. Required non-empty check across all fields | Minimal stub strings | **No** |
| 2. Full name: 2+ words separated by space | `"a"` (single char) | **No** |
| 3. Email: `/^\S+@\S+$/` format check | `"not-an-email"` (no `@`) | **No** |
| 4. Phone: 11-digit Nigerian mobile prefix | `"1"` (1 digit) | **No** |
| 5. Shop docket number: integer `>= 100` | `0` | **No** |
| 6. Counter claim PIN: 5–8 non-identical digits | `"1"` (1 digit) | **No** |
| 7. Password: minimum 10 characters | `"1"` (1 character) | **No** |
| 8. Record-keeping terms & privacy checkbox (`true`) | `false` | **No** |

*(In addition, via the browser UI itself — `evidence/15-form-attack-results.txt` — several client checks were already defeated without even opening `curl`: `"a         "` passed the 10-char password check, `"a@b"` passed the loose email regex, and trailing spaces on `"amaka@example.com   "` plus a 240-character name and 15-digit docket created `Account #3`.)*

---

## 3. What This Proves About Client Validation vs. Security

Client-side validation lives in user-controlled JavaScript running inside an untrusted browser. It is strictly a **usability and feedback layer** that saves honest customers like Amaka Obi a wasted cellular round-trip when she mistypes her phone prefix or misses a word in her name. It offers **zero security boundary** because any script, attacker, or `curl` invocation talks straight to the HTTP route handler (`POST /api/auth/register`), completely ignoring React state, regexes, HTML attributes (`required`, `inputMode`), and `aria-disabled` buttons. Shipping a careful accessible UI in front of an unvalidated endpoint leaves the database wide open to junk data, bot floods, unconsented records (`termsAccepted: false`), and credential abuse.

---

## 4. What Task Four Will Do About It

In **Task 04 (`task-04-server-security/`)**, `/api/auth/register` becomes the real enforcement boundary:
1. **Zod schema validation at the route boundary** *before* touching SQLite—rejecting invalid payloads with `400 Bad Request` and re-enforcing every Task 3 rule (plus `fullName`/`docketNumber` upper bounds, strict email regex, `.trim()` on strings, `password.trim().length >= 10` rejecting whitespace-padded passwords like `"a         "`, and `z.literal(true)` on `termsAccepted`).
2. **Normalisation & safe storage:** Lowercase and trim email addresses everywhere; trim leading/trailing whitespace on passwords without lowercasing; never store plaintext passwords or counter claim PINs—hash them with a slow memory-hard/adaptive algorithm (**Argon2id** or **bcrypt**).
3. **Abuse & credential controls:** Rate limiting on auth endpoints (`429 Too Many Requests`), breached-password prefix checking (k-anonymity), and cryptographically random 6-digit email verification dispatched in a background job.
