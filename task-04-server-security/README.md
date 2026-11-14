# Task 04: The Server Is the Source of Truth (`task-04-server-security/`)

## What This Task Was
Transformed the defenseless client-validated authentication prototype from Task 03 into a secure, production-grade server boundary. Proved that the server is the sole source of truth by enforcing Zod boundary validation on incoming payloads, implementing Argon2id memory-hard hashing, executing forward-only Prisma database migrations, defeating and understanding rate limits, verifying breached passwords via k-anonymity, and delivering asynchronous cryptographically-generated 6-digit email verification codes.

---

## What We Built
- **Database Schema & Deliberate Migrations (`prisma/schema.prisma`):**
  - Designed and migrated 7 relational tables: `customers`, `sessions`, `pickup_requests`, `payments`, `payment_attempts`, `verification_codes`, and `ledger_chunks`.
  - Proved forward-only migration discipline: captured the deliberate required-column failure on a populated table (`evidence/04`), recovered via the 3-step safe migration pattern (`evidence/05`), and hit the runtime schema drift error on purpose (`evidence/06`).
- **Cryptographic Credential Storage (`src/lib/security/password.ts`):**
  - Argon2id hashing with $64\text{ MiB}$ memory cost, $t=3$ iterations, and CSPRNG salt.
  - Hardware benchmark (`evidence/08`): Argon2id runs at **`85.904 ms/hash`** ($\approx 11.64\text{ hashes/sec}$) vs SHA-256 at **`0.000447 ms/hash`** ($\approx 2.2\text{M hashes/sec}$), proving why memory-hard adaptive hashing halts GPU cracking attacks.
- **Server Boundary Validation (`src/lib/validation/auth.ts`):**
  - Zod schemas enforcing all Task 03 rules on `/api/auth/register`, `/login`, `/verify`, and `/reset`.
  - Repeated the Task 03 direct `curl` attack (`evidence/12`): rejected with **`HTTP 400 Bad Request`** and a full field-error breakdown instead of being inserted into SQLite.
  - Normalisation: lowercased and trimmed emails (`evidence/09`); trimmed passwords without lowercasing (`evidence/10`).
- **Abuse Gating & Breached Password Check:**
  - Rate limiting (`evidence/13` & `14`): enforced 5 requests per 15 minutes returning `HTTP 429`, then demonstrated IP defeat via proxy rotation.
  - Breached password prevention (`src/lib/security/breach-check.ts`, `evidence/15`): checked password candidates against Have I Been Pwned via k-anonymity (5-character SHA-1 prefix).
- **Asynchronous Email Verification Flow (`src/lib/email/`):**
  - CSPRNG 6-digit code generation stored hashed with SHA-256, 7-minute expiry, and single-use invalidation (`evidence/19`).
  - Decoupled SMTP dispatch to an asynchronous background job, cutting signup response time from seconds to `138 ms` (`evidence/18`).
  - Tested and captured all three failure cases: expired code (`evidence/20`), wrong code (`evidence/21`), and reused code (`evidence/22`).

---

## What We Decided
- **Argon2id over SHA-256 and bcrypt:** Chosen for its state-of-the-art resistance to GPU/ASIC parallelization via memory-hardness ($64\text{ MiB}$).
- **Propose-and-Stop Migration Rule:** Enforced `AGENT.md` Rule 3 prohibiting automated agent migration execution, ensuring human engineering review of destructive DDL and table backfills.
- **Fail-Open Rate Limiting Strategy:** Prioritized honest neighbourhood laundry customers like Amaka Obi accessing their dockets during rate-store network blips rather than failing closed.
- **Four Explicitly Omitted Controls (`docs/not-implemented.md`):** Justified omitting Redis clusters, TOTP/SMS 2FA, interactive CAPTCHAs, and field-level KMS envelope encryption for this single-shop stage.

---

## What We Got Wrong / Known Defects
1. **In-Memory Rate Limiting (`docs/defects.md` #1):** Counters are stored in a process-local `Map`, wiping on Node restart and partitioned across multiple instances.
2. **Missing Account-Level Lockout (`docs/defects.md` #2):** Attackers cycling IPs can send 5 guesses per IP indefinitely without locking the customer's account row.
3. **In-Memory Ephemeral Email Queue (`docs/defects.md` #3):** `enqueueVerificationEmail` relies on `setImmediate`; an unhandled crash or restart drops the unsent email.
4. **Minimal Offline Breach Corpus (`docs/defects.md` #4):** Offline fallback contains only 8 passwords if the external HIBP network request times out.
