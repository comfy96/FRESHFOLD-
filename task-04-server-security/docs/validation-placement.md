# Validation Placement & Lifecycle Architecture (`docs/validation-placement.md`)

*(Step 6: Where validation sits in the HTTP lifecycle, what runs before it, what must never run before it, and why handwritten route checks fail in production.)*

---

## 1. Where in the Request Lifecycle Validation Sits
In Fresh Fold Laundry (`src/app/api/auth/register/route.ts`), request execution follows a strict sequential pipeline:
1. **Transport & Gateway Layer:** TLS termination, HTTP method routing (`POST`), and host header checks.
2. **Coarse Abuse Guard (Rate Limiting):** `checkRateLimit('register', clientIp)` runs *before* JSON parsing, rejecting abusive connections (`429 Too Many Requests`) with zero CPU spent on payload deserialisation.
3. **Payload Deserialisation:** `request.json()` parses raw wire bytes into an untrusted object, catching malformed JSON (`400 Bad Request`).
4. **Schema Boundary Validation (Zod):** `registerSchema.safeParse(rawBody)` validates every field's type, length, regex shape, and business constraints (`400 Bad Request` with field error map). **The raw request body is replaced strictly with `parsed.data` and never accessed again.**
5. **Breached Credential Lookup (k-Anonymity):** `checkBreachedPassword(data.password)` checks the HIBP 5-char SHA-1 range *only after* the password is confirmed to meet the 10-character minimum length.
6. **State & Database Boundary:** Duplicate email lookup (`SELECT`), Argon2id hashing (`~86 ms`), and transactional insertion (`$transaction`) into `customers` and `verification_codes`.
7. **Asynchronous Side Effects:** `enqueueVerificationEmail` dispatches SMTP delivery outside the request lifecycle.

---

## 2. What Runs Before Validation
- **Network rate limiting & connection gating:** Evaluating IP and connection frequency counters takes sub-millisecond CPU time. Running rate limits before schema parsing prevents Denial-of-Service (DoS) attacks where attackers flood huge JSON payloads designed to exhaust CPU memory during validation.
- **Safe JSON deserialisation:** The runtime must convert raw request bytes into a JavaScript object before schema validation can inspect its fields.

---

## 3. What Must NEVER Run Before Validation
The following operations must **never** precede schema boundary validation:
1. **Database queries or transactions:** Running `findUnique` or any SQL statement with unvalidated input invites SQL injection, type confusion, or unnecessary database locks on garbage requests.
2. **Expensive cryptographic operations (Argon2id hashing):** Hashing takes `~86 ms` and $64\text{ MiB}$ of RAM per invocation. If hashing ran before checking if `fullName` or `email` was valid, an attacker could paralyze the entire Node.js event loop by sending thousands of invalid requests with 1-character names.
3. **External network calls (email delivery, SMS gateways, HIBP lookups):** Triggering external APIs before local schema validation wastes outbound bandwidth, money, and vendor quota on unformed requests.
4. **Authorisation or business logic state changes:** Writing rows, claiming dockets, or deducting funds on unvalidated data corrupts ledger integrity permanently.

---

## 4. Why Validating by Hand in Route Handlers Is Worse Than a Schema
Handwritten validation (`if (!body.name || body.name.length < 3) ...`) looks simple in small demos, but degrades rapidly in production:
1. **Partial validation leakage:** Handwritten checks inevitably miss fields, fail to enforce upper bounds (e.g., allowing a 10MB string that exhausts memory), or forget trimming (`"amaka@example.com   "`).
2. **Retaining dirty raw input:** Route handlers validating by hand continue using the raw `body` variable across the function. If one field passed a check but wasn't normalised, downstream database queries receive untrusted input. Schemas enforce **parse, don't validate**: `registerSchema.parse()` produces a brand-new typed, trimmed, and sanitized `data` object while discarding untrusted raw properties.
3. **Duplicated & divergent rules:** Without a centralized schema file (`src/lib/validation/auth.ts`), registration, password reset, and profile updates end up with slightly different email and phone regexes, causing bugs where a user registers successfully but cannot log in or reset their password.
4. **Scattered error formatting:** Schemas guarantee consistent structured error dictionaries (`fieldErrors: { email: "..." }`) matching the frontend's inline alert mapping.
