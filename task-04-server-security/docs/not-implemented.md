# Security Controls Explicitly Not Implemented (`docs/not-implemented.md`)

*(Step 12: Four security controls considered for Fresh Fold Laundry, deliberately omitted at this stage, with concrete triggers for adding each later.)*

---

## 1. Distributed Redis Cluster for Rate Limiting
- **What it is:** An external shared memory store (e.g., managed Redis / Upstash) holding sliding-window or token-bucket counters across multiple application server instances.
- **Why not worth it at this stage:** Fresh Fold Laundry serves one neighbourhood laundry shop from a single Next.js + SQLite process (`src/app/`). Running and paying for a dedicated Redis cluster adds hosting cost, TLS credential management, network round-trip latency on every auth call, and another service that can fail independently on a tight Nigerian shop budget. In-process / SQLite-backed counters protect the single-node deployment cleanly right now.
- **What would have to change to add it:** Deploying horizontally across multiple Node containers, serverless functions (`Vercel` / multiple ECS tasks), or multi-region replicas where per-process memory counters diverge and let an attacker multiply their request allowance by the instance count.

---

## 2. Customer Two-Factor Authentication (TOTP Authenticator App or SMS 2FA)
- **What it is:** Requiring every customer to pair an authenticator app (TOTP) or pay for an SMS OTP on every login in addition to email + password.
- **Why not worth it at this stage:** Amaka Obi logs in from an entry-level Android smartphone primarily to check whether her 6 shirts and 2 wrappers are washed and whether her bank transfer cleared. SMS delivery in Nigeria costs per-message fees at thin laundry margins and frequently stalls on overloaded mobile networks; TOTP apps confuse non-technical customers and cause lockouts when phones are swapped. One-time email verification plus strong Argon2id passwords and shop counter PINs at physical collection already match the risk profile.
- **What would have to change to add it:** Either allowing online stored card wallets / wallet payouts where account takeover causes direct cash loss, or introducing staff/admin routes that can edit customer financial ledgers (staff accounts should enforce 2FA first).

---

## 3. Interactive CAPTCHA / Proof-of-Work Challenges on Registration
- **What it is:** Embedding visual puzzle widgets (reCAPTCHA / Turnstile) on `/auth?mode=signup` to filter automated signups.
- **Why not worth it at this stage:** Heavy third-party anti-bot scripts inflate page weight, break offline/slow-2G progressive enhancement on budget Android browsers, and introduce extra screen-reader and accessibility barriers right after Task 03 removed tab traps for assistive users. Boundary Zod validation, IP + email rate limiting, breached-password rejection, and requiring email verification before trust raise the cost of bulk bot signups without punishing real shop customers.
- **What would have to change to add it:** Observing sustained coordinated headless-browser signup floods rotating residential IPs faster than per-IP/per-subnet rate limits and email verification cleanup can absorb.

---

## 4. Field-Level KMS Envelope Encryption for SQLite Columns at Rest
- **What it is:** Integrating a cloud Key Management Service (AWS KMS / GCP KMS) to encrypt PII columns (`phone`, `full_name`) per row in application memory before SQLite writes.
- **Why not worth it at this stage:** Passwords, counter claim PINs, and verification OTPs are already irreversibly hashed (`Argon2id` / `SHA-256`) rather than encrypted, and the portal does not store bank card PANs or BVN numbers. Envelope encryption prevents normal indexed SQL queries (such as staff counter lookup by partial phone/name), requires key-rotation runbooks, and breaks local single-command setup (`npm run dev`). Full-disk OS/volume encryption plus strict SQLite file permissions cover local disk theft more pragmatically for a single shop.
- **What would have to change to add it:** Expanding into multi-branch franchising under regulated fintech/health data residency mandates or storing government ID numbers / sensitive payment instruments alongside laundry receipts.

