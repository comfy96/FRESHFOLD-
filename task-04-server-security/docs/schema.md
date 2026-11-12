# Database Schema Design (`docs/schema.md`)

*(Step 1: Designed on paper first (`evidence/01-schema-drawing.jpg`), covering all four required entity groups for Fresh Fold Laundry.)*

---

## 1. Entity Overview (7 Tables)
1. **People (`customers`):** Customer identity, Nigerian shop docket/contact metadata, Argon2id password & counter-PIN hashes, verification status, role, and soft-deletion fields (for Tasks 04–05).
2. **Sessions (`sessions`):** Server-side authenticated browser sessions storing hashed session tokens and expiry (wired in Task 05).
3. **Pickup Requests (`pickup_requests`):** Existing Task 02 laundry drop-off/pickup ledger entries tied to a customer record.
4. **Money (`payments`):** Immutable record of completed/settled laundry payments in Nigerian Naira (`kobo` integer minor units).
5. **Money Attempts (`payment_attempts`):** Separate ledger of initiated, failed, abandoned, or network-dropped payment attempts.
6. **Email Verification (`verification_codes`):** Cryptographically generated 6-digit codes, hashes, expiry timestamps, and retry state.
7. **Retrieval Chunks (`ledger_chunks`):** Pre-chunked ledger/FAQ text rows with metadata ready for retrieval-augmented lookup without altering transactional tables.

---

## 2. Table-by-Table Column Specification

### `customers`
| Column | Type | Nullable? | Notes / Constraints |
|---|---|---|---|
| `id` | `INTEGER` (`@id @default(autoincrement())`) | No | Primary key |
| `full_name` | `TEXT` | No | Customer name on laundry bag |
| `email` | `TEXT` (`@unique`) | No | Normalised trimmed + lowercased email |
| `phone` | `TEXT` | No | 11-digit Nigerian mobile (`070`/`080`/`081`/`090`/`091`) |
| `docket_number` | `INTEGER` | No | Primary physical shop docket number (`>= 100`) |
| `claim_pin_hash` | `TEXT` | No | Argon2id hash of 5–8 digit counter claim PIN |
| `password_hash` | `TEXT` | No | Argon2id hash of user password (never plaintext) |
| `role` | `TEXT` (`@default("customer")`) | No | `'customer'` or `'staff'` (for Task 05 RBAC) |
| `email_verified` | `INTEGER / BOOLEAN` (`@default(false)`) | No | `true` only after OTP check passes |
| `verified_at` | `DATETIME` | **Yes** | `NULL` until verified |
| `terms_accepted` | `INTEGER / BOOLEAN` (`@default(false)`) | No | Must be `true` on valid registration |
| `deleted_at` | `DATETIME` | **Yes** | `NULL` unless scheduled for NDPA soft deletion (Task 05) |
| `created_at` | `DATETIME` (`@default(now())`) | No | Account creation timestamp |

### `sessions`
| Column | Type | Nullable? | Notes / Constraints |
|---|---|---|---|
| `id` | `INTEGER` (`@id @default(autoincrement())`) | No | Primary key |
| `customer_id` | `INTEGER` (FK $\rightarrow$ `customers.id`) | No | Owning customer |
| `token_hash` | `TEXT` (`@unique`) | No | SHA-256 hash of cookie session secret |
| `expires_at` | `DATETIME` | No | Session expiry timestamp |
| `revoked_at` | `DATETIME` | **Yes** | `NULL` while active; set on logout/reset |
| `created_at` | `DATETIME` (`@default(now())`) | No | Login timestamp |

### `pickup_requests`
| Column | Type | Nullable? | Notes / Constraints |
|---|---|---|---|
| `id` | `INTEGER` (`@id @default(autoincrement())`) | No | Primary key |
| `customer_id` | `INTEGER` (FK $\rightarrow$ `customers.id`) | **Yes** | Nullable for pre-Task-03 Task 02 guest rows |
| `customer_name` | `TEXT` | No | Historical bag label snapshot |
| `phone` | `TEXT` | No | Historical callback number snapshot |
| `docket_number` | `INTEGER` | **Yes** | Shop receipt docket linked to batch |
| `item_count` | `INTEGER` | No | Garment quantity counted |
| `service_mode` | `TEXT` | No | `'Wash & Fold'` \| `'Wash & Iron'` \| `'Stain Check'` |
| `notes` | `TEXT` (`@default("")`) | No | Optional item note |
| `created_at` | `DATETIME` (`@default(now())`) | No | Pickup request timestamp |

### `payments`
| Column | Type | Nullable? | Notes / Constraints |
|---|---|---|---|
| `id` | `INTEGER` (`@id @default(autoincrement())`) | No | Primary key |
| `customer_id` | `INTEGER` (FK $\rightarrow$ `customers.id`) | No | Paying customer |
| `docket_number` | `INTEGER` | No | Shop docket being settled |
| `amount_kobo` | `INTEGER` | No | Exact amount in kobo (zero float rounding error) |
| `currency` | `TEXT` (`@default("NGN")`) | No | ISO currency code |
| `channel` | `TEXT` | No | `'bank_transfer'` \| `'pos_counter'` \| `'cash'` |
| `provider_ref` | `TEXT` (`@unique`) | No | Bank/gateway settlement reference |
| `paid_at` | `DATETIME` | No | Confirmed settlement timestamp |
| `created_at` | `DATETIME` (`@default(now())`) | No | Ledger insertion timestamp |

### `payment_attempts`
| Column | Type | Nullable? | Notes / Constraints |
|---|---|---|---|
| `id` | `INTEGER` (`@id @default(autoincrement())`) | No | Primary key |
| `customer_id` | `INTEGER` (FK $\rightarrow$ `customers.id`) | **Yes** | Customer initiating attempt (`NULL` only on anonymised purge) |
| `docket_number` | `INTEGER` | No | Shop docket intended for settlement |
| `amount_kobo` | `INTEGER` | No | Attempted payment amount in kobo |
| `status` | `TEXT` | No | `'initiated'` \| `'failed'` \| `'abandoned'` \| `'timeout'` \| `'succeeded'` |
| `failure_reason` | `TEXT` | **Yes** | Gateway timeout / insufficient funds / dropped 2G socket |
| `idempotency_key` | `TEXT` (`@unique`) | No | Prevents double-charging on retry |
| `attempted_at` | `DATETIME` (`@default(now())`) | No | When customer tapped Pay |

### `verification_codes`
| Column | Type | Nullable? | Notes / Constraints |
|---|---|---|---|
| `id` | `INTEGER` (`@id @default(autoincrement())`) | No | Primary key |
| `customer_id` | `INTEGER` (FK $\rightarrow$ `customers.id`) | No | Target account |
| `purpose` | `TEXT` (`@default("email_verify")`) | No | `'email_verify'` \| `'password_reset'` |
| `code_hash` | `TEXT` | No | Hash of CSPRNG 6-digit OTP |
| `expires_at` | `DATETIME` | No | Expiry (`created_at + 7 minutes`) |
| `used_at` | `DATETIME` | **Yes** | `NULL` until redeemed (enforces single-use retry safety) |
| `attempts` | `INTEGER` (`@default(0)`) | No | Wrong-code guesses counter |
| `created_at` | `DATETIME` (`@default(now())`) | No | Generation timestamp |

### `ledger_chunks`
| Column | Type | Nullable? | Notes / Constraints |
|---|---|---|---|
| `id` | `INTEGER` (`@id @default(autoincrement())`) | No | Primary key |
| `customer_id` | `INTEGER` (FK $\rightarrow$ `customers.id`) | **Yes** | `NULL` for public shop pricing/FAQ chunks; set for private row ACL |
| `source_type` | `TEXT` | No | `'order_summary'` \| `'payment_receipt'` \| `'shop_policy'` |
| `source_id` | `INTEGER` | **Yes** | Reference record ID (`pickup_requests.id` or `payments.id`) |
| `content` | `TEXT` | No | Chunked plain-text passage for future retrieval |
| `token_count` | `INTEGER` | No | Approximate token size of chunk |
| `created_at` | `DATETIME` (`@default(now())`) | No | Chunk generation timestamp |

---

## 3. Relationships
- **`customers` $\rightarrow$ `sessions`:** One-to-many (`1:N`) — a customer may sign in from phone and laptop.
- **`customers` $\rightarrow$ `pickup_requests`:** One-to-many (`1:N`) — one customer submits many pickup batches.
- **`customers` $\rightarrow$ `payments`:** One-to-many (`1:N`) — one customer makes many laundry payments.
- **`customers` $\rightarrow$ `payment_attempts`:** One-to-many (`1:N`) — one customer generates zero or more payment attempts per settled docket.
- **`customers` $\rightarrow$ `verification_codes`:** One-to-many (`1:N`) — resend or reset issues new codes over time.
- **`customers` $\rightarrow$ `ledger_chunks`:** One-to-many (`1:N`, optional for shop-wide policies) — scopes future retrieval strictly by customer ownership.

*(There is no `M:N` table needed right now because each laundry docket, pickup batch, and payment belongs to a single customer account; if family sub-accounts are added later, a `household_memberships` join table would model `M:N`.)*

---

## 4. Indexes & Write Costs

| Table & Column(s) | Why Indexed | Cost on Writes |
|---|---|---|
| `customers(email)` (`UNIQUE`) | Instant login, duplicate check, and password-reset lookup by lowercase email without scanning all customers. | Every `INSERT` or email `UPDATE` must update and lock the B-tree unique index to verify no collision. |
| `sessions(token_hash)` (`UNIQUE`) | Middleware verifies every incoming request cookie against hashed tokens in $O(\log n)$. | Slightly slower `INSERT` on login and row update on logout/revocation. |
| `sessions(customer_id)` | Enables fast "log out of all devices" / password-reset bulk session revocation. | Extra B-tree insert on every login. |
| `pickup_requests(customer_id, created_at)` | Serves Amaka's `/orders` screen sorted newest-first scoped strictly to her rows. | Composite B-tree maintenance on every new pickup submission. |
| `payments(customer_id, paid_at)` | Fast dated payment history ("Our records show") and tax audit export by date range. | Maintains composite tree entry on every confirmed payment. |
| `payments(provider_ref)` (`UNIQUE`) | Prevents webhook or manual staff entry from crediting the same transfer reference twice. | Unique key check + tree update per settled payment. |
| `payment_attempts(customer_id, attempted_at)` | Lets support inspect why a customer's payment failed on flaky mobile data right before calling the shop. | Slows every high-frequency tap of "Pay now" slightly because attempts must write before redirect. |
| `payment_attempts(idempotency_key)` (`UNIQUE`) | Stops retry taps on 2G connections from spawning duplicate gateway charges. | Unique constraint lookup on each payment initiation. |
| `verification_codes(customer_id, created_at)` | Retrieves the latest active verification code quickly and invalidates older ones cleanly. | Index page update on code issue and redemption. |
| `ledger_chunks(customer_id, source_type)` | Enforces strict per-customer access filtering before any future retrieval scoring runs. | Additional index write whenever orders/receipts are re-chunked. |

---

## 5. Intentional Duplication (Storing the Same Fact Twice)
- **`pickup_requests.customer_name`, `pickup_requests.phone`, `pickup_requests.docket_number`, and `payments.docket_number` duplicate fields on `customers`:**
  **Why accepted:** A paper laundry docket and counter receipt are historical physical facts at the time garments are dropped off or paid for. If Amaka updates her phone number or moves to a newer primary docket booklet six months later, past pickup receipts and transfer logs must still display the exact phone number and docket number written on the shop bag that week—otherwise historical "Our records show" lookups diverge from paper counter books.

---

## 6. Why `payment_attempts` Is Separate from `payments`
1. **Drop-off diagnosis on bad mobile networks:** Amaka Obi uses an entry-level Android on intermittent mobile data. When she tries to pay ₦3,500 by transfer and her 2G signal drops mid-checkout, `payments` would record nothing. Logging `payment_attempts` with `status = 'timeout'` or `'abandoned'` reveals *where* and *why* customers lose confidence at checkout—distinct from settled revenue in `payments`.
2. **Audit trail, disputes, and 14-month tax inquiries:** Mixing unconfirmed attempts into `payments` corrupts revenue totals, while dropping failed attempts destroys proof during disputes. **If the Nigerian tax authority (FIRS/LIRS) asked fourteen months later to account for a ₦12,000 transaction reference from last February:** we would query `payments` (`provider_ref`, `paid_at`, `amount_kobo`, `channel`) alongside the linked `payment_attempts` sequence (`idempotency_key`, `attempted_at`, `status`, `failure_reason`) and the tied `docket_number` on `pickup_requests`, proving whether a charge failed/timed out once before settling once or never cleared into our bank—without exposing unrelated customers or guessing from missing rows.

