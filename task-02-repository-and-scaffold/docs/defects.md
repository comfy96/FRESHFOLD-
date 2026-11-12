# Known Defects — Task 02: Repository, Scaffold & Diagnostics

Per assessment standards, this document records genuine defects currently present in our Task 02 codebase with exact file locations and production costs.

---

### Defect 1: Unauthenticated `/orders` Route Exposes All Customers' Pickup Rows
- **Location:** `src/app/orders/page.tsx:24-26` and `src/app/api/pickup-requests/route.ts:7-9`
- **What is wrong:** Both the Server Component `/orders` and `GET /api/pickup-requests` execute `SELECT id, customer_name, phone, item_count... FROM pickup_requests ORDER BY id DESC LIMIT 10` without authentication or user scoping.
- **Production cost:** Directly violates our business brief's #1 rule (*"A customer sees the truth about her own order... and never anyone else's"*). Any visitor opening `/orders` or hitting `/api/pickup-requests` can read Amaka Obi's and Tunde Bakare's personal phone numbers, item counts, and notes until session authentication and ownership checks are implemented in Tasks 04–05.

---

### Defect 2: Runtime `CREATE TABLE IF NOT EXISTS` Executed Inside `getDb()`
- **Location:** `src/lib/db.ts:24-35`
- **What is wrong:** `getDb()` runs DDL (`CREATE TABLE IF NOT EXISTS pickup_requests (...)`) and opens a fresh `DatabaseSync` handle on every single HTTP request instead of running versioned forward-only migrations ahead of time.
- **Production cost:** Adds unnecessary disk lock checks on every API call and fails completely when adding required non-nullable columns or indexes later—cannot safely evolve production data without proper migration discipline (Task 04).

---

### Defect 3: Naive API Payload Checks & Unhandled Raw Database Error Exposure
- **Location:** `src/app/api/pickup-requests/route.ts:21-34` and `src/app/api/pickup-requests/route.ts:51-55`
- **What is wrong:** `POST /api/pickup-requests` validates fields using loose JavaScript truthiness (`!customerName || !phone`) with no schema validation library (`Zod`), no Nigerian phone length/shape validation, and no rate limiting. Worse, line 54 returns raw `err.message` strings directly to clients in `500` JSON responses.
- **Production cost:** Bots or direct `curl` clients can flood SQLite with junk single-character names (`"a"`) or negative/huge item counts, while database failures leak internal `DATABASE_URL` environment configuration details to attackers.

---

### Defect 4: `PickupForm` Number Field Uses Client-Side Stripping Without Server Re-Validation or Offline Queueing
- **Location:** `src/app/pickup/PickupForm.tsx:78-85`
- **What is wrong:** Although `itemCount` filters non-digits on the client (`replace(/\D/g, '')`), the browser still allows empty/zero submits if bypassed via `curl`, and the form offers no local `localStorage`/IndexedDB draft persistence if Amaka's data bundle drops mid-submission.
- **Production cost:** When signal drops between form entry and `fetch`, Amaka loses her typed notes and must retype them once her connection returns.

