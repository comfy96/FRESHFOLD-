# Rate Limiting Design & Limits (`docs/rate-limiting.md`)

*(Step 8: Configuration, shared-IP consequences, storage trade-offs, and why IP alone is easily defeated.)*

---

## 1. Threshold & Window Justification (`src/lib/security/rate-limit.ts`)
- **Threshold & window:** **5 requests per 15 minutes** per `(routeKey, clientIp)` across `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/verify`, and `POST /api/auth/reset`, returning **`HTTP 429 Too Many Requests`** with `Retry-After`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining`.
- **Why these numbers:** A real laundry customer registering or mistyping a password twice easily fits inside 5 attempts in 15 minutes (remember client-side validation catches ordinary formatting errors before sending a request). Meanwhile, automated brute-force guessing against a 6-digit OTP or login credential is capped to 5 tries per quarter hour instead of thousands per second.

---

## 2. Why IP Alone Is Insufficient & What Serious Applications Key On
Relying solely on client IP fails in two directions:
1. **Trivial bypass (`evidence/14-rate-limit-defeated.txt`):** Our limiter reads `x-forwarded-for` first (trusting proxy headers if not stripped by an upstream reverse proxy) and even against genuine socket IPs, toggling mobile data / switching Wi-Fi / rotating VPN or residential proxies hands an attacker fresh 5-request buckets instantly.
2. **What else production systems key on:**
   - **Normalised target account (`email` / `customerId`):** Caps brute force against Amaka's specific inbox even across 1,000 rotating botnet IPs. *(Trade-off: lets an attacker intentionally lock out a victim's email unless paired with CAPTCHA/step-up challenge instead of blanket account blocks.)*
   - **Hardware / client fingerprint & signed cookie tokens / subnet prefixes (`/24` IPv4, `/64` IPv6):** Slows low-cost header rotation cleanly, at the cost of complexity and privacy surface.

---

## 3. Counter Storage Choice & Shared-Connection Impact
- **Where stored & trade-off:** Counters currently live in an **in-process `Map<string, BucketEntry>`** attached to `globalThis`. It gives microsecond zero-dependency checks for our single Next.js + SQLite shop server, with two real costs: counters wipe cleanly if Node restarts/deploys, and multiple server instances would not share counts (documented in `docs/not-implemented.md`).
- **Effect on a shared office, hostel, or Nigerian cybercafé NAT connection:** Because multiple customers on the same MTN/Airtel hotspot or campus Wi-Fi share one public IPv4 address, 5 rapid signups or mistyped logins across different families behind that router lock out everyone else sharing that exit IP for up to 15 minutes (`HTTP 429`), which is another reason email-keyed + IP-keyed composite buckets belong in multi-tenant production.
