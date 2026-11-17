# Fresh Fold Laundry

*(Repository Layout: Single monorepo containing all five sequential assessment folders `task-01-*` through `task-05-*` alongside the active Next.js web application under `src/` and database migrations under `prisma/`.)*

---

## 1. What this is

Fresh Fold Laundry is a lightweight, tamper-evident customer record portal and neighbourhood ledger engineered for Nigerian laundry and dry-cleaning services.

The system is built specifically around the real-world operational constraints of **Amaka Obi**—a customer persona navigating intermittent 2G/3G mobile data on a budget Android smartphone (e.g., Tecno or Infinix running Android Go). The application prioritises verified, dated visibility into laundry item counts, processing stages, pickup dispatches, and payment balances ("Our records show" receipt-book tone)—ensuring absolute data isolation so no customer can ever view another customer's records.

The repository follows a strict monorepo architecture containing:
- **`src/`**: The complete Next.js 15 App Router application (TypeScript, pure CSS Modules, and custom security/validation libraries).
- **`prisma/`**: Relational database schema and deterministic forward-only SQLite migrations.
- **`task-01-design-system/`** through **`task-05-sessions-compliance-defence/`**: Self-contained documentation, benchmarks, defect trackers, and forensic evidence captures for each sequential assessment milestone.

---

## 2. Status

| Milestone | Directory | Branch | Status | Key Deliverables & Evidence |
| :--- | :--- | :--- | :--- | :--- |
| **Task 01: Design System** | `task-01-design-system/` | `main` | **Finished** | Pinned `#007B71` Primary 40, Light/Dark token sets, 15-style `Plus Jakarta Sans` type scale (`57/80`, `-0.25px`), brand-tinted shadows, token-to-CSS compiler script (`task-01-design-system/scripts/build-tokens.js`), static receipt screen, and evidence `01`–`12`. |
| **Task 02: Repo & Scaffold** | `task-02-repository-and-scaffold/` | `main` | **Finished** | Phased Next.js 15 App Router scaffold, pure CSS Modules (zero Tailwind), SQLite persistence (`POST /api/pickup-requests` returning `HTTP 201`), cold/warm benchmarks (`1,414 ms` $\rightarrow$ `13 ms`), server breakages & recoveries, false-success mitigation, hand-drawn working tree diagram (`14`), Git `--no-ff` graph proof (`15`), and information design (`clamp()` type, 7-word tagline, Open Graph metadata, collapsed CTA). |
| **Task 03: Client Validation** | `task-03-client-validation/` | `main` | **Finished** | Unified Single-Page Auth (`/auth?mode=signup\|login\|reset`, reduced 6 pages $\rightarrow$ 4 pages), shop-derived validation rules, `<input type="text" inputMode="numeric">` for dockets, Chrome AXTree accessibility fixes (`CautionIcon`, `aria-disabled` + explanation alert), direct `curl` `HTTP 201` bypass proof showing client rules offer zero backend security, and deterministic rollback (`git reset --hard 2f67f2e`). |
| **Task 04: Server Security** | `task-04-server-security/` | `main` | **Finished** | 7-table Prisma relational schema, forward-only migrations (`init`, `add_optional_window`, `make_window_required`), intentional drift recovery, Argon2id benchmark (`85.904 ms/hash` vs SHA-256 `0.000447 ms/hash`), Zod boundary schema validation rejecting direct attacks with `HTTP 400`, email/password normalisation, 5 req/15 min rate limiting and defeat analysis, HIBP k-anonymity breach check, asynchronous background SMTP email dispatch (`138 ms` response), and single-use CSPRNG 6-digit OTP verification flow. |
| **Task 05: Sessions & Defence** | `task-05-sessions-compliance-defence/` | `feat/task-05-sessions-compliance-defence` | **Finished** | 256-bit CSPRNG sessions with SHA-256 token hashing, soft vs hard gating flows, constant-time login timing (`DUMMY_ARGON2_HASH`), zero-lie logout edge case fix, multi-device reset revocation, NDPA/CAMA lawful account deletion pipeline with idempotent purge jobs, primary research interview with laundry owner, 7-chapter handbook, 8-item self-awareness audit, published article, and all 22 interview answers (`01`–`17`). |

### Version Control & Pull Request Tracking
- **Local `main` Branch (`4fd1874`):** Contains all merged, verified commits for Tasks 01 through 04.
- **Feature Branches:**
  - `feat/task-04-server-security`: Pushed to remote `origin`.
  - `feat/task-03-client-validation`: Completed and merged locally into `main`.
  - `feat/task-05-sessions-compliance-defence`: Active development branch.
- **Pushing to GitHub:** Because GitHub deprecated account passwords for Git HTTPS operations in August 2021, pushes require either an SSH key (`git remote set-url origin git@github.com:comfy96/FRESHFOLD-.git`) or a GitHub Personal Access Token (PAT) with `repo` scope when using HTTPS.

---

## 3. The stack, with reasons

Each technology in the stack was chosen to satisfy strict operational, security, and low-bandwidth constraints:

1. **Next.js 15 (App Router) + TypeScript:**
   - *Reason:* Unifies the client user interface, server-side data rendering, and backend API Route Handlers (`/api/auth/*`, `/api/pickup-requests`) into a single type-safe codebase. This eliminates the operational overhead of running separate frontend and backend server processes while maintaining end-to-end TypeScript interfaces.
2. **Pure CSS Modules & Semantic Design Tokens (`src/styles/variables.css`):**
   - *Reason:* Zero Tailwind or heavy utility-class frameworks. Every visual style references two-tier CSS custom properties (`--color-*`, `--type-*`, `--shadow-*`) compiled directly from Figma design tokens. This minimizes initial stylesheet payloads and avoids heavy DOM styling recalculations on low-tier mobile hardware.
3. **SQLite with Prisma ORM (`prisma/schema.prisma`):**
   - *Reason:* SQLite provides an embedded, zero-daemon transactional database stored directly on disk (`file:./freshfold.db`). Prisma provides compile-time type safety, relational foreign key constraints, and deterministic, forward-only schema migrations without external database infrastructure or cloud dependencies.
4. **Argon2id Password Hashing (`argon2`):**
   - *Reason:* State-of-the-art password hashing with $64\text{ MiB}$ memory cost, $t=3$ iterations, and CSPRNG salt. It was chosen over legacy SHA-256 and standard bcrypt because its memory-hardness defeats parallelized GPU/ASIC cracking attacks. Hardware benchmarks confirm Argon2id takes **`85.904 ms/hash`** ($\approx 11.6\text{ hashes/sec}$) compared to SHA-256's **`0.000447 ms/hash`** ($\approx 2.2\text{M hashes/sec}$).
5. **Zod Boundary Schema Validation (`src/lib/validation/auth.ts`):**
   - *Reason:* Enforces strict data boundary schemas at all HTTP endpoints. Requests containing missing fields, invalid phone formats, malformed email addresses, or unaccepted terms are rejected with `HTTP 400 Bad Request` before touching database queries.
6. **Node.js `crypto` (CSPRNG & SHA-256):**
   - *Reason:* Generates cryptographically strong pseudo-random tokens (`crypto.randomBytes(32)`) for sessions and 6-digit OTP codes. Raw tokens are never stored in the database; only SHA-256 one-way hashes are persisted, preventing credential theft even if the SQLite database file is leaked.
7. **Nodemailer with Decoupled Background Dispatch (`src/lib/email/mailer.ts`):**
   - *Reason:* Asynchronous email delivery is offloaded via `setImmediate`, decoupling external SMTP server latency from the user's registration handshake. Signup API responses return in **`138 ms`**, while verification emails transmit reliably in the background.

---

## 4. Getting started

### Prerequisites
- **Node.js:** Version **`v22.5+`** (tested on **`v26.13.0`** and **`v22.11.0 LTS`**; required for built-in SQLite support). Verify with:
  ```bash
  node -v
  ```
- **npm:** Version **`v10+`**.

### Installation & Fresh Setup
Follow these exact commands in order from a clean clone:

```bash
# 1. Clone the repository
git clone https://github.com/comfy96/FRESHFOLD-.git
cd FRESHFOLD-

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env

# 4. Deploy database migrations and generate Prisma Client
npx prisma migrate deploy
npx prisma generate

# 5. Start the development server
npm run dev
```

### Key Local Routes to Explore
Open your browser to `http://localhost:3000` to interact with the system:
- **`http://localhost:3000/`**: Home landing shell featuring the brand tagline, service window notice, and primary navigation.
- **`http://localhost:3000/auth?mode=signup`**: Single-Page Auth flow with tabbed navigation for **Sign up**, **Log in**, and **Reset password**, complete with shop-derived validation and accessible alert messaging.
- **`http://localhost:3000/pickup`**: Laundry collection booking form with service mode selectors and immediate SQLite persistence.
- **`http://localhost:3000/orders`**: Internal shop ledger displaying verified customer orders and timestamps.

### Verification & Testing Commands
```bash
# Verify TypeScript compiles with zero errors:
npx tsc --noEmit

# Inspect database tables, relations, and records visually:
npx prisma studio
```

---

## 5. Environment variables

All environment configuration is managed via `.env` in the project root. A tracked template is maintained at `.env.example`. **Never commit `.env` or production credentials to source control.**

| Variable | Required | Default / Example | Purpose & Operational Impact |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | **Yes** | `file:./freshfold.db` | File path connection string for the local SQLite database used by Prisma ORM and `src/lib/db.ts`. |
| `SMTP_HOST` | No | `smtp.ethereal.email` | Outgoing SMTP mail server hostname for delivering 6-digit OTP codes. When omitted in development, verification codes are logged directly to the server terminal. |
| `SMTP_PORT` | No | `587` | Port for SMTP mail transmission (e.g., `587` for STARTTLS, `465` for SSL/TLS). |
| `SMTP_USER` | No | `user@freshfold.ng` | Authentication username for the SMTP gateway. |
| `SMTP_PASS` | No | `password` | Authentication password for the SMTP gateway. |
| `SMTP_FROM` | No | `Fresh Fold Laundry <noreply@freshfold.ng>` | Formatted email sender header displayed in the customer's inbox. |
| `NEXT_PUBLIC_SITE_URL` | No | `http://localhost:3000` | Canonical base origin URL used by Next.js `metadataBase` in `src/app/layout.tsx` to resolve Open Graph and social preview assets. |

---

## 6. What this deliberately does not do

The system deliberately avoids standard commercial SaaS patterns that fail under Nigerian retail constraints:

1. **No generative AI chatbot or conversational UI:**
   - *Rationale:* Customers inquiring about laundry intake weights, garment damage, or payment deductions require deterministic, verifiable records ("Our records show"). Generative AI models introduce hallucination risks and conversational ambiguity that erode trust during commercial disputes.
2. **No external Redis cluster:**
   - *Rationale:* Maintaining an external Redis cluster for a single-shop ledger adds unnecessary network points of failure, cold-start latency, and monthly hosting fees. In-process token buckets with fail-open semantics ensure honest customers can still check dockets if caching infrastructure hiccups.
3. **No SMS or app-based TOTP 2FA:**
   - *Rationale:* Nigerian SMS telco aggregators charge substantial per-message fees ($\approx \$0.04/\text{SMS}$) and experience frequent delivery timeouts during peak traffic. Standalone authenticator apps (e.g., Google Authenticator) introduce severe setup friction and lockout risks for non-technical users on basic Android devices. Cryptographic email OTP combined with physical counter claim PINs matches the actual threat profile without user lockouts.
4. **No third-party interactive CAPTCHAs:**
   - *Rationale:* External CAPTCHA scripts (e.g., reCAPTCHA, Cloudflare Turnstile) inject heavy JavaScript payloads that degrade mobile performance and stall on flaky 2G connections. Automated abuse is filtered server-side via IP rate limiting, Zod schema validation, and Have I Been Pwned k-anonymity breach checks.
5. **No raw credential persistence:**
   - *Rationale:* The database never stores plaintext passwords, raw session cookies, or plaintext verification codes. Passwords use memory-hard Argon2id hashes, while session tokens and OTPs use SHA-256 digests.

---

## 7. Known defects

All known issues are documented honestly with exact file paths, line numbers, and architectural impact:

1. **Unauthenticated `/orders` Ledger Route (`src/app/orders/page.tsx:23-26`, `src/app/api/pickup-requests/route.ts:7-9`):**
   - *Impact:* The shop records page displays recent customer pickup requests without validating a session cookie or verifying customer ownership.
   - *Remediation:* Handled in Task 05 via Next.js middleware and session token validation.
2. **In-Memory Rate Limiting Bucket Store (`src/lib/security/rate-limit.ts:17-26`):**
   - *Impact:* Rate-limiting buckets are stored in `globalThis.__freshfoldRateLimits`. Restarting the Node.js server process clears all active rate-limiting counters, and horizontal scaling across multiple processes partitions bucket state.
   - *Remediation:* Acceptable for single-node deployment; requires durable storage if clustered.
3. **Missing Account-Level Lockout on Failed Sign-ins (`src/app/api/auth/login/route.ts:50-75`):**
   - *Impact:* Rate limiting throttles requests per client IP address (5 attempts per 15 minutes), but does not lock customer accounts when an attacker cycles through multiple proxy IP addresses.
   - *Remediation:* Task 05 incorporates customer-level failed attempt counters.
4. **Ephemeral In-Process Email Queue (`src/lib/email/mailer.ts:56-65`):**
   - *Impact:* Asynchronous email dispatch relies on Node's `setImmediate`. If the server experiences a fatal crash or restart while an email is queued, the unsent verification code is lost without a persistent retry record.
   - *Remediation:* Production hardening requires a durable database-backed transactional outbox.
5. **Minimal Offline Breach Corpus (`src/lib/security/breach-check.ts:9-18`):**
   - *Impact:* When the server cannot reach Have I Been Pwned's API (e.g., network failure or timeout), the system falls back to a minimal hardcoded 8-password list (`password123`, `1234567890`, etc.).
   - *Remediation:* Bundle a larger pre-computed offline bloom filter of the top 100,000 common passwords.
6. **Design System Figma Token Artifacts (`task-01-design-system/docs/defects.md`):**
   - *Impact:* Light Mode `Surface_Container_Lowest` maps to `#2B3230` (`1.31:1` contrast ratio, deliberately avoided in production UI), `error 60–99` tokens export as `#FFFFFF`, and `Plus Jakarta Sans` typography relies on system/CDN fallbacks without bundled offline `.woff2` files.
