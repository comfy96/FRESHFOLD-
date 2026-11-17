# Known Architectural Defects & Remediation: Task 05 (`docs/defects.md`)

**Business:** Fresh Fold Laundry  
**Assessment Milestone:** Task 05: Sessions, Lawful Account Deletion & The Full Defence  
**Date:** 2026-11-17  

---

## Defect 1: Passive Session Expiry without Automatic Database Pruning

- **Location:** [`src/lib/security/session.ts:5-8, 53-100`](file:///Users/APPLE/Desktop/FRESHFOLD/src/lib/security/session.ts#L5-L8)
- **Observed Behavior:**  
  When a session exceeds its 7-day duration (`expiresAt < NOW()`), `validateSession` correctly returns `null` and blocks customer access. However, the expired session row remains in SQLite `sessions` table until the customer explicitly logs out or resets their password.
- **Root Cause:**  
  SQLite is an embedded, zero-daemon database that lacks an active background TTL daemon (unlike Redis `EXPIRE`). Rows only delete when an explicit query executes.
- **Architectural Impact:**  
  Abandoned sessions accumulate over time, increasing database file size and index B-tree depth.
- **Production Remediation:**  
  Add an opportunistic pruning routine inside `createSession` or schedule a nightly cron job: `DELETE FROM sessions WHERE expires_at < NOW()`.

---

## Defect 2: Emergency "Force Leave Anyway" Logout Leaves Server Session Row Active

- **Location:** [`src/app/orders/LogoutButton.tsx:28-44`](file:///Users/APPLE/Desktop/FRESHFOLD/src/app/orders/LogoutButton.tsx#L28-L44)
- **Observed Behavior:**  
  When a customer's cellular connection experiences a total network blackout during logout, the UI catches the fetch failure and displays a persistent retry alert. If the customer taps "Force Leave Anyway", the frontend clears local state and navigates to the login screen. However, the server never received the revocation request, meaning the session row in SQLite remains valid until its 7-day expiration.
- **Root Cause:**  
  Defensive trade-off between user autonomy and server state synchronization: an offline browser cannot force a remote server to delete a database row without network connectivity.
- **Architectural Impact:**  
  If the customer abandoned the physical device and a second actor possessed an active network connection and the raw cookie before it expired, ledger access could theoretically be restored.
- **Production Remediation:**  
  Register a Service Worker with Background Sync API (`navigator.serviceWorker.ready.then(sw => sw.sync.register('revoke-session'))`) to queue and replay the server revocation request the moment network connectivity resumes.

---

## Defect 3: Sequential In-Process Deletion Job Lacks Batch Chunking

- **Location:** [`src/lib/deletion/job.ts:40-105`](file:///Users/APPLE/Desktop/FRESHFOLD/src/lib/deletion/job.ts#L40-L105)
- **Observed Behavior:**  
  `runDeletionPurgeJob` queries all eligible soft-deleted accounts in a single batch (`prisma.customer.findMany`) and iterates sequentially over each account in-process.
- **Root Cause:**  
  Designed for a neighbourhood laundry volume (~180 customers, 1-2 deletions per month).
- **Architectural Impact:**  
  At regional or national enterprise scale (e.g. 50,000 deletion requests per day), executing a massive un-chunked loop inside the Next.js process would block the Node.js event loop and cause long-running SQLite write locks.
- **Production Remediation:**  
  Introduce batch limits (e.g. `take: 100`), processing purges in discrete chunks with intermediate event-loop yields (`setImmediate`), or offload to an external queue worker (e.g. BullMQ / Temporal).

---

## Defect 4: In-Memory Rate Limiting Key Leakage on Proxy Headers

- **Location:** [`src/lib/security/rate-limit.ts:28-38`](file:///Users/APPLE/Desktop/FRESHFOLD/src/lib/security/rate-limit.ts#L28-L38)
- **Observed Behavior:**  
  `getClientIp` inspects `X-Forwarded-For` and accepts the first comma-separated IP address.
- **Root Cause:**  
  Enables flexible testing across local subnets and developer environments.
- **Architectural Impact:**  
  If Fresh Fold is deployed behind an untrusted reverse proxy or direct internet ingress without stripping client-injected headers, an attacker can spoof arbitrary `X-Forwarded-For` IP addresses to bypass rate limiting completely (as demonstrated in `task-04-server-security/evidence/14-rate-limit-defeated.txt`).
- **Production Remediation:**  
  Configure edge proxies (e.g. Cloudflare, NGINX) to overwrite `X-Forwarded-For` with the true TCP peer IP, or restrict IP extraction to verified upstream CIDR blocks.
