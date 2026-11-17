# Technical Self-Awareness Audit: What I Do Not Know (`docs/what-i-do-not-know.md`)

**Author:** Engineering Team, Fresh Fold Laundry  
**Date:** November 2026  
**Purpose:** Demonstrating technical humility, architectural self-awareness, and explicit learning roadmaps across 8 genuine technical blind spots.  

---

## 1. SQLite Write-Ahead Logging (WAL) Checkpoint Contention under Multi-Worker Node.js Concurrency
- **What I Do Not Know:**  
  While I understand that SQLite WAL mode (`PRAGMA journal_mode=WAL;`) allows concurrent readers alongside a single writer, I do not possess hands-on profiling experience managing checkpoint starvation (`SQLITE_BUSY` errors) when multiple Node.js worker threads or cluster processes execute high-frequency concurrent writes against a single database file.
- **Why It Matters for Fresh Fold:**  
  If Fresh Fold expands to 15 physical branch locations sharing a single mounted SQLite file, write locks could stall counter clerks checking in laundry batches during Saturday morning peak hours.
- **Investigation Plan:**  
  I will write a load-testing harness using `k6` to fire 200 concurrent write requests per second against an SQLite instance in WAL mode, observing `wal_checkpoint(TRUNCATE)` timing, and study D1 / Litestream replication architectures.

---

## 2. Cross-Device Passkey (WebAuthn) Synchronization Mechanics on Uncertified Android Go Devices
- **What I Do Not Know:**  
  I know how the WebAuthn API exchanges public key challenges in standard browsers, but I do not know how FIDO2 passkey synchronization behaves across budget Android Go handsets that lack Google Play Services certification or have hardware keystore limitations.
- **Why It Matters for Fresh Fold:**  
  Moving beyond passphrases to biometric passkeys could eliminate password reset friction for customers like Amaka Obi, but only if low-cost Android hardware supports secure enclave hardware signing without crashing.
- **Investigation Plan:**  
  Borrow physical Tecno and Infinix test devices running Android 10/11 Go Edition, implement a minimal `@simplewebauthn` prototype, and log keystore exceptions across budget devices.

---

## 3. NDPA Cross-Border Transfer Compliance for Foreign Cloud SMTP Relays (AWS SES / SendGrid)
- **What I Do Not Know:**  
  Under Section 41 of the Nigeria Data Protection Act (NDPA) 2023, cross-border transfers of personal data require an adequacy decision or standard contractual clauses. I do not fully know the legal assessment criteria enforced by the Nigeria Data Protection Commission (NDPC) regarding whether transmitting a Nigerian customer's email address and verification code through AWS SES servers located in `eu-west-1` (Ireland) constitutes an unauthorized foreign transfer without explicit regulatory filing.
- **Why It Matters for Fresh Fold:**  
  Using foreign transactional mail gateways is standard engineering practice, but regulatory non-compliance carries statutory fines up to ₦10,000,000.
- **Investigation Plan:**  
  Consult with a certified Nigerian Data Protection Compliance Organization (DPCO) and review the NDPC's published Whitelist of Adequate Jurisdictions and Standard Contractual Clauses (SCC) guidelines.

---

## 4. Mobile Carrier-Grade NAT (CGNAT) Connection Teardown on Cellular Gateways
- **What I Do Not Know:**  
  I understand standard HTTP keep-alive headers, but I do not know the exact timeout thresholds enforced by major Nigerian mobile network operators (MTN, Airtel, Glo) on their Carrier-Grade NAT (CGNAT) middleboxes before they silently terminate idle TCP sessions.
- **Why It Matters for Fresh Fold:**  
  If an idle TCP connection is silently severed by MTN's CGNAT middlebox while Amaka is reading an order summary, her subsequent request experiences a SYN retransmission stall (up to 3 seconds) before establishing a new socket.
- **Investigation Plan:**  
  Set up a packet capture monitor on a real cellular connection using Wireshark and `tcpdump`, testing idle socket intervals from 10 seconds to 5 minutes to measure middlebox TCP RST / FIN injection behaviors.

---

## 5. Linux Kernel Entropy Pool Depletion on Shared Cloud Micro-Instances
- **What I Do Not Know:**  
  While Node's `crypto.randomBytes(32)` utilizes the operating system CSPRNG (`getrandom(2)` / `/dev/urandom`), I have never observed or profiled how virtualized cloud micro-instances (e.g. AWS `t4g.nano` or shared VPS nodes) behave under sustained entropy starvation when generating thousands of simultaneous session tokens and Argon2id salts upon server cold boot.
- **Why It Matters for Fresh Fold:**  
  If the kernel entropy pool blocks or falls back to predictable seeds during a traffic burst on low-tier virtual machines, session predictability vulnerabilities could arise.
- **Investigation Plan:**  
  Spin up a minimal Linux VPS, run high-volume `getrandom` benchmark scripts while draining entropy via `/dev/random`, and monitor `/proc/sys/kernel/random/entropy_avail` alongside Node.js event loop latency.

---

## 6. Next.js App Router Chunk Sub-Resource Integrity (SRI) on Dynamic CDN Edge Caches
- **What I Do Not Know:**  
  Next.js dynamically generates hashed script chunks for App Router server components. I do not know the exact build-pipeline configuration required to inject Sub-Resource Integrity (`integrity="sha384-..."`) attributes into Next.js dynamically injected runtime scripts without breaking streaming SSR.
- **Why It Matters for Fresh Fold:**  
  SRI protects customers from malicious CDN tampering or man-in-the-middle script injection, which is a known risk when mobile traffic passes through aggressive carrier optimization proxies.
- **Investigation Plan:**  
  Research Webpack and Next.js internal manifest generation plugins, test `@next/bundle-analyzer` hooks, and evaluate experimental SRI implementations in Next.js 15.

---

## 7. CSS `@layer` Precedence Conflicts with Next.js CSS Modules Ordering
- **What I Do Not Know:**  
  I know how CSS Modules scope classes locally, but I do not fully understand how Next.js App Router resolves `@layer` cascade priority when splitting CSS Modules across server components, client components, and global utility files during production minification.
- **Why It Matters for Fresh Fold:**  
  In Task 01, we established strict token hierarchies (`--color-*`). If component-level styles accidentally invert cascade priority due to unpredictable chunk concatenation in Next.js production builds, design token inheritance could break silently.
- **Investigation Plan:**  
  Build a dedicated test suite with multiple conflicting `@layer` definitions in CSS Modules, compile a production build (`next build`), and inspect the concatenated output in `.next/static/css/` to document the exact ordering rules.

---

## 8. B-Tree Page Fragmentation & VACUUM Locking Overhead in Long-Lived SQLite Databases
- **What I Do Not Know:**  
  Our deletion pipeline anonymizes customer records and deletes verification codes daily. I do not know how rapidly SQLite B-tree pages fragment under continuous deletion cycles over 3 to 5 years, nor have I measured the disk I/O locking duration of executing `PRAGMA auto_vacuum = INCREMENTAL;` versus a blocking full `VACUUM;` on an embedded database holding 500,000 ledger rows.
- **Why It Matters for Fresh Fold:**  
  If a maintenance cron executes a full `VACUUM` during business hours, the entire SQLite file is locked, preventing intake clerks from saving new laundry pickups for several seconds.
- **Investigation Plan:**  
  Populate a test SQLite database with 1,000,000 simulated orders and payments, run thousands of deletion cycles, and benchmark query latency before, during, and after `VACUUM` operations using `sqlite3_analyzer`.
