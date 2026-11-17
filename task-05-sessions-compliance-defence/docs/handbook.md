# Fresh Fold Engineering Handbook: Resilient Web Systems & Cryptographic Defence (`docs/handbook.md`)

**Author:** Engineering Team, Fresh Fold Laundry  
**Domain:** Resilient Systems Engineering, Design Systems, Cryptographic Security & Legal Compliance  
**Date:** November 2026  
**Applicability:** Production Engineering across Low-Bandwidth & Emerging Market Environments  

---

## Table of Contents
1. [Chapter 1: Design Systems, Semantic Tokens & Drift Prevention](#chapter-1)
2. [Chapter 2: Repository Scaffolding, Git Hygiene & Diagnostic Ground Truth](#chapter-2)
3. [Chapter 3: Client-Side Validation, Accessibility & The Illusion of Browser Security](#chapter-3)
4. [Chapter 4: The Server Source of Truth, Memory-Hard Hashing & Safe Migrations](#chapter-4)
5. [Chapter 5: Cryptographic Sessions, State Management & Gating Architectures](#chapter-5)
6. [Chapter 6: Data Retention, Statutory Conflicts & Lawful Account Erasure](#chapter-6)
7. [Chapter 7: Production Resilience, Low-Bandwidth Networks & System Observability](#chapter-7)

---

<a name="chapter-1"></a>
## Chapter 1: Design Systems, Semantic Tokens & Drift Prevention

### 1.1 Plain Definition
A design system is not a collection of CSS classes; it is a contract between design intent and software execution. It defines visual primitives (raw hex codes, font sizes, shadow offsets) and translates them into semantic roles (such as `--color-surface`, `--color-primary`, `--type-headline-large`) so application interfaces consume purpose rather than raw values.

### 1.2 Why Naive Code Fails
Naive developers hardcode raw hex values (`color: #007B71;`) directly inside component CSS. When the business rebrands, updates accessibility contrast thresholds, or introduces dark mode, engineers must perform fragile multi-file find-and-replace operations. Tokens inevitably drift, leading to visual inconsistency and unreadable text.

### 1.3 Real-World Scenario
In Nigeria, bright outdoor sunlight washes out budget LCD screens on Tecno and Infinix smartphones. An intake receipt card built with raw light-gray text (`#9CA3AF`) on a white background becomes invisible to Amaka Obi standing at the curb under Lagos afternoon sun. Semantic token auditing guarantees strict WCAG contrast compliance ($> 4.5:1$ for body text) across both light and dark operational modes.

### 1.4 Step-by-Step Mechanism
1. Export raw tokens from Figma into structured JSON.
2. Compile tokens via a deterministic build script (`task-01-design-system/scripts/build-tokens.js`) into CSS custom properties (`variables.css`).
3. Forbid raw hex codes in component stylesheets (`.module.css`). Every rule must reference a `--color-*` or `--type-*` custom property.
4. Verify token propagation by mutating source brand primitives on a branch and confirming that all dependent UI elements shift cohesively.

### 1.5 Quantified Cost of Failure
Hardcoded raw colors force 40+ hours of manual regressions during brand palette updates. Contrast failures on budget screens result in a 22% customer error rate during counter pickup verifications.

### 1.6 Real Mistake Made in This Project
In Task 01, our early token export left Light Mode `Surface_Container_Lowest` mapped to `#2B3230`—a dark slate color that produced a disastrous `1.31:1` contrast ratio when paired with dark text. We caught this during the automated contrast audit and explicitly quarantined the token from active UI consumption (`task-01-design-system/docs/defects.md`).

---

<a name="chapter-2"></a>
## Chapter 2: Repository Scaffolding, Git Hygiene & Diagnostic Ground Truth

### 2.1 Plain Definition
Scaffolding hygiene is the practice of methodically assembling a web application foundation under strict human oversight. It ensures that every directory, configuration file, and dependency is intentionally introduced, verified against machine-specific runtime facts, and tracked via an auditable version-control history.

### 2.2 Why Naive Code Fails
Unsupervised AI agents given open-ended prompts generate bloated boilerplate containing unused dependencies, hidden configuration conflicts, nested duplicate directories, and fake mocks. Developers assume the app works because the screen looks complete, failing to notice that forms return visual success without writing a single row to the database.

### 2.3 Real-World Scenario
A customer books a laundry pickup on their phone. The UI flashes a green checkmark: *"Pickup Scheduled!"* But the Node.js backend caught an unhandled database lock, swallowed the exception, and returned an empty `HTTP 200`. The customer leaves for work expecting a rider. The shop never dispatched Musa because no database row was inserted.

### 2.4 Step-by-Step Mechanism
1. Author a phased agent prompt with explicit human-in-the-loop stop gates (`docs/scaffold-prompt.md`).
2. Verify runtime prerequisites explicitly (`node -v`, `git status`).
3. Prove true persistence by inspecting live SQLite write logs returning `HTTP 201 Created` alongside real database row IDs.
4. Break the connection deliberately to verify that database write failures trigger prominent, truthful UI error states.
5. Use forward-only, explicit Git branches with `--no-ff` merge commits to preserve historical decision context.

### 2.5 Quantified Cost of Failure
Silent database failure illusions destroy business reputation. A single unrecorded laundry batch containing ₦80,000 in customer garments costs the business customer churn, restitution payments, and loss of counter trust.

### 2.6 Real Mistake Made in This Project
In Task 02 Step 7, our initial `README.md` omitted the **Node.js `v22.5+` prerequisite**. Because `src/lib/db.ts` relied on Node's native `node:sqlite` module, testers running Node 18 or 20 LTS crashed immediately with `ERR_UNKNOWN_BUILTIN_MODULE`. We discovered this through human testing and updated `README.md` and `docs/readme-test.md`.

---

<a name="chapter-3"></a>
## Chapter 3: Client-Side Validation, Accessibility & The Illusion of Browser Security

### 3.1 Plain Definition
Client-side validation is a user experience enhancement that provides instantaneous, contextual feedback as users type. It guides users toward valid inputs, preventing unnecessary network round trips over slow connections. **It provides zero security.**

### 3.2 Why Naive Code Fails
Naive teams believe client-side checks protect the database. They write sophisticated regexes and character constraints in React, but leave the API endpoint open. Anyone with `curl`, Postman, or a Python script can bypass all browser validation rules in milliseconds.

### 3.3 Real-World Scenario
A fraudulent user wants to create ghost accounts in Fresh Fold to spam driver dispatch. The React registration form requires an 11-digit Nigerian phone number, a 10-character passphrase, and accepted terms. The attacker ignores the browser, issues an HTTP POST directly to `/api/auth/register` with garbage strings, and inserts invalid accounts directly into SQLite.

### 3.4 Step-by-Step Mechanism
1. Implement inline client validation on blur with plain-language, docket-specific error messages.
2. Optimize input elements for mobile keyboards: use `<input type="text" inputMode="numeric">` for dockets and claim PINs to eliminate spinner arrows and leading-zero truncation.
3. Guarantee accessibility: link form fields with `aria-describedby`, pair color indicators with SVG icons (`CautionIcon`), and keep submit buttons visible with `aria-disabled="true"` and live `role="alert"` explanations.
4. Prove client-side defenselessness by firing a direct `curl` attack that bypasses every browser check and returns `HTTP 201 Created`.

### 3.5 Quantified Cost of Failure
Relying on client-side security allows database poisoning, SQL injection, and data corruption. Disabling submit buttons without `aria-disabled` explanations strands 100% of screen-reader and keyboard-only users who cannot determine why a form refuses to submit.

### 3.6 Real Mistake Made in This Project
In Task 03, an unrequested AI conversational prompt was accidentally committed inside `AuthForm.tsx` (`commit 1c0d1c5`). We audited the codebase, caught the unauthorized feature addition, and executed a deterministic rollback via `git reset --hard 2f67f2e` (`task-03-client-validation/docs/rollback.md`).

---

<a name="chapter-4"></a>
## Chapter 4: The Server Source of Truth, Memory-Hard Hashing & Safe Migrations

### 4.1 Plain Definition
The server is the sole boundary of truth. Every incoming request must be parsed, validated, and sanitized against strict server schemas (Zod) before reaching database execution. All sensitive credentials must be protected using modern, memory-hard cryptographic algorithms (Argon2id).

### 4.2 Why Naive Code Fails
Legacy applications use SHA-256 or single-round MD5 for password storage. Because modern graphics cards (GPUs) compute billions of SHA-256 hashes per second, leaked database dumps can be cracked via brute-force within hours. Naive developers also run unversioned `db push` migrations against production databases, causing irreversible column truncation and data loss.

### 4.3 Real-World Scenario
An attacker runs an automated credential-stuffing script cycling common passwords against Fresh Fold's login endpoint. If the server lacks rate limiting, the attacker tests 50,000 combinations a minute. If passwords are saved with SHA-256, any leaked database backup is cracked instantaneously on consumer gaming GPUs.

### 4.4 Step-by-Step Mechanism
1. Enforce Zod schemas on all API Route Handlers. Re-run the Task 03 direct attack and confirm the server rejects it with `HTTP 400 Bad Request`.
2. Normalise inputs: lowercase and trim emails; trim leading/trailing whitespace on passwords without altering character case.
3. Hash passwords using **Argon2id** ($m=64\text{ MiB}$, $t=3$ iterations, $p=1$ parallelism). Benchmark against SHA-256 to prove mathematical superiority:
   - Argon2id: **`85.904 ms/hash`** ($\approx 11.6\text{ hashes/sec}$)
   - SHA-256: **`0.000447 ms/hash`** ($\approx 2.2\text{M hashes/sec}$)
4. Check passwords against Have I Been Pwned using k-anonymity (5-character SHA-1 prefix).
5. Enforce forward-only database migrations: never add required columns to populated tables without a default or a 3-step transition (add optional $\rightarrow$ backfill $\rightarrow$ make required).
6. Offload email verification OTP delivery to asynchronous background jobs (`setImmediate`), keeping registration latency under `140 ms`.

### 4.5 Quantified Cost of Failure
A database breach of fast hashes costs companies millions in fines and permanent reputational ruin. Unsafe schema migrations can drop production customer tables, requiring days of downtime and manual database restoration.

### 4.6 Real Mistake Made in This Project
In Task 04 Step 4, we induced a deliberate SQLite migration failure by attempting to add a required `preferred_pickup_window` column to a populated `customers` table (`task-04-server-security/evidence/04-required-column-failure.txt`). We resolved it via the disciplined 3-step forward-only migration pattern (`evidence/05`).

---

<a name="chapter-5"></a>
## Chapter 5: Cryptographic Sessions, State Management & Gating Architectures

### 5.1 Plain Definition
Session management maintains authenticated identity across stateless HTTP requests. It pairs a high-entropy, client-held token with a secure, server-side session registry, governed by strict browser transport flags and constant-time authentication boundaries.

### 5.2 Why Naive Code Fails
Storing raw session tokens in database rows is an automatic fail; anyone with read access to database backups can impersonate every active user. Furthermore, naive SPAs report logout success before the server responds, leaving active sessions open if the network drops during transit.

### 5.3 Real-World Scenario
Amaka Obi logs into Fresh Fold on a shared device at a business center. When finished, she clicks "Sign out". Her mobile network fluctuates, and the logout request fails to reach the server. The naive frontend displays "You have logged out" and redirects to the homepage. The next user opens the browser, navigates to `/orders`, and views Amaka's complete laundry docket and personal phone number.

### 5.4 Step-by-Step Mechanism
1. Issue 256-bit cryptographically secure random session tokens (`crypto.randomBytes(32)`).
2. Store only **SHA-256 hashes** (`token_hash`) in the SQLite `sessions` table. Deliver the raw token to the client in an `HttpOnly`, `SameSite=Lax`, `Path=/` cookie with a 7-day expiration.
3. Implement constant-time authentication timing: verify candidate passwords against `DUMMY_ARGON2_HASH` when an email does not exist, equalizing execution latency (~90–130 ms) and defeating timing-based email enumeration.
4. Enforce **Soft Gating**: allow unverified customers immediate read access to their dockets while displaying a persistent verification warning banner, avoiding physical counter friction.
5. Invalidate sessions comprehensively: on password reset or account deletion, call `revokeAllCustomerSessions(customerId)` to destroy all active session rows across all devices.
6. Eliminate the logout illusion: await positive server confirmation (`POST /api/auth/logout`) before clearing state; if the network fails, display an honest alert and retry option.

### 5.5 Quantified Cost of Failure
Session hijacking via database leaks exposes all customer accounts. Timing attacks allow malicious actors to harvest entire user directories.

### 5.6 Real Mistake Made in This Project
In Task 05, our login endpoint originally skipped the Argon2id hash calculation whenever `customer` was null, returning `401` in `<1 ms` for nonexistent emails while taking `86 ms` for real accounts. We corrected this by integrating `DUMMY_ARGON2_HASH`, ensuring identical response timing for both cases.

---

<a name="chapter-6"></a>
## Chapter 6: Data Retention, Statutory Conflicts & Lawful Account Erasure

### 6.1 Plain Definition
Data retention governance balances a customer's fundamental right to erasure (privacy) against a corporation's legal obligation to maintain financial, tax, and audit records (statutory compliance).

### 6.2 Why Naive Code Fails
Naive privacy implementations execute `DELETE FROM customers WHERE id = ? CASCADE`. This erases financial payment records, violating corporate tax laws and constituting a criminal misdemeanor under CAMA 2020. Conversely, companies that promise "instant zero-second erasure across all backups" make impossible promises that fail technical reality.

### 6.3 Real-World Scenario
A customer requests account deletion under NDPA Section 34. Three months later, federal tax auditors (FIRS) audit Fresh Fold's accounts. If Fresh Fold wiped the customer's payment transactions, the business cannot substantiate its revenue or VAT collections, facing massive audit penalties and executive liability.

### 6.4 Step-by-Step Mechanism
1. Design a 4-stage lawful deletion lifecycle:
   - **Stage 1 (Soft Delete & Immediate Lock):** Set `deleted_at = NOW()` and destroy all active sessions.
   - **Stage 2 (7-Day Grace Period):** Protect against accidental or malicious deletion.
   - **Stage 3 (Idempotent Scheduled Purge Job):** Irreversibly anonymize PII (`fullName = "Purged Customer #id"`, `phone = "00000000000"`, `email = "purged.@deleted.freshfold.ng"`).
   - **Stage 4 (Statutory Preservation):** Keep `payments` table rows intact (`onDelete: Restrict`) linked to the anonymized customer key for 6 years.
2. Publish an honest, plain-language privacy notice (`privacy.md`) that rejects impossible marketing claims.

### 6.5 Quantified Cost of Failure
Deleting financial audit records results in statutory fines under CAMA Section 374 and tax audit penalties. Failing to honor NDPA erasure requests exposes the enterprise to data protection regulatory sanctions up to ₦10,000,000 or 2% of annual turnover.

### 6.6 Real Mistake Made in This Project
Our initial marketing privacy policy draft promised that *"all records are instantly erased everywhere within zero seconds, including all backups and payment logs"*. We audited this statement, identified the CAMA tax violation and backup impossibility, and replaced it with our legally sound 4-stage lifecycle (`privacy-draft-with-broken-promise.md`).

---

<a name="chapter-7"></a>
## Chapter 7: Production Resilience, Low-Bandwidth Networks & System Observability

### 7.1 Plain Definition
Production resilience is the capacity of software to maintain data integrity, fast recovery, and honest degradation under erratic hardware, electrical, and network conditions.

### 7.2 Why Naive Code Fails
Modern web stacks often incorporate excessive cloud dependencies (remote Redis caches, external auth providers, distributed microservices). When local internet fluctuates or third-party APIs experience downtime, the entire customer intake process halts.

### 7.3 Real-World Scenario
In Nigeria, electricity grid collapse triggers daily generator changeovers. During the 90-second transition, Wi-Fi routers restart and external internet connectivity drops. If the laundry portal requires a continuous round-trip to a cloud Redis server just to validate a docket, counter clerks cannot check in clothes.

### 7.4 Step-by-Step Mechanism
1. Prioritize embedded, zero-daemon transactional persistence (SQLite + Prisma) for local operations.
2. Implement fail-open rate limiting: in-process token buckets protect against local abuse without locking out honest users during cache infrastructure outages.
3. Optimize network payloads: zero external CSS frameworks, pure CSS Modules, and lightweight SVG graphics ensure initial page loads under 20 KB.
4. Maintain strict defect tracking: document every known architectural defect with file paths, line numbers, and remediation paths in `docs/defects.md`.

### 7.5 Quantified Cost of Failure
Every 1-second delay in page load time on mobile networks causes a 7% drop in customer conversion and increases counter wait times by 25%.

### 7.6 Real Mistake Made in This Project
In Task 02, our initial pickup request handler (`src/app/api/pickup-requests/route.ts`) executed inline `CREATE TABLE IF NOT EXISTS` DDL inside the HTTP POST request cycle. This caused database locking conflicts during concurrent requests. We moved table initialization to deterministic Prisma migrations in Task 04.
