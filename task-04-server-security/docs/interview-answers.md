# Task 04 Interview Defence (`docs/interview-answers.md`)

All nineteen interview questions answered with technical precision from our Fresh Fold Laundry implementation, strictly under 200 words each.

---

### 1. Why should you hash passwords?
Passwords must be hashed using a one-way cryptographic function so that the plaintext secret is never stored on disk, never held in database backups, and never visible to database administrators or engineers. If attackers gain read access to the database through SQL injection, unpatched backup exposure, or server compromise, hashes prevent them from immediately reading or reusing passwords. When a user authenticates, the server re-hashes the submitted candidate with the stored salt and parameters; if the derived digests match, identity is verified without the server ever needing to know or reconstruct the plaintext secret.

---

### 2. Why use bcrypt instead of SHA-256 for passwords?
SHA-256 was designed for fast integrity verification, computing millions of digests per second. While fast is ideal for checksums, it is catastrophic for password storage: modern GPUs can calculate billions of SHA-256 hashes per second, allowing attackers to exhaust dictionary spaces in minutes. In contrast, bcrypt (and Argon2id) is an adaptive, deliberately slow hashing algorithm. It incorporates a configurable work factor that increases computation time geometrically, forcing attackers to spend significant CPU and RAM per guess. Slowing down password verification to ~86 ms costs a legitimate user nothing noticeable, but destroys the economics of offline brute-force attacks.

---

### 3. What is a salt and why do you need it?
A salt is a cryptographically random byte sequence generated uniquely for every password before hashing and stored alongside the derived digest. Salts solve two critical vulnerabilities:
1. **Rainbow tables:** Precomputed lookup tables of hashes mapped back to plaintexts become useless, because an attacker would need to regenerate multi-terabyte tables for every unique salt.
2. **Identical digest correlation:** Without salts, two users who choose the same common password (like `"Password123!"`) would have identical hashes in the database. A salt guarantees that even identical passwords produce completely different hash strings, forcing an attacker to crack each stolen account individually.

---

### 4. What salt rounds, or what work factor, should you use? Give a number and defend it.
For bcrypt, use **work factor 12** (or for Argon2id, $m=65536\text{ KiB}, t=3, p=1$). A work factor of 12 represents $2^{12} = 4,096$ hashing iterations. On modern server hardware, work factor 12 takes approximately **80 to 120 milliseconds** per hash. This strikes the optimal balance between security and user experience: 100 ms is virtually imperceptible to human users during interactive login, yet limits a server core to roughly 10 guesses per second. Setting it below 10 (e.g. 8) makes offline GPU cracking feasible; setting it above 14 (e.g. 15, taking ~2 seconds) exhausts server CPU under concurrent login spikes.

---

### 5. Plain text, SHA-256, AES-256 encryption, and adaptive hashing: which is correct and why are the other three wrong?
**Adaptive hashing (Argon2id or bcrypt) is correct.**
- **Plain text** is completely undefended: any database leak immediately exposes all credentials.
- **SHA-256** is wrong because it is non-adaptive and computed too fast: attackers with GPUs crack millions of guesses per second.
- **AES-256 encryption** is wrong for a fundamentally different reason: encryption is **two-way (reversible)**, requiring an encryption key. Storing encrypted passwords introduces an unmanageable key lifecycle liability—if an attacker breaches the application server or memory to steal the decryption key, they decrypt every customer's plaintext password in bulk. Password verification never requires reversibility.

---

### 6. Why is client-side validation not enough?
Client-side validation runs inside browser JavaScript and HTML that the client controls entirely. Any client can disable scripts, alter client state via DevTools, or bypass the browser altogether using `curl`, Python, or Postman to send requests directly to backend endpoints. In our Task 03 test, sending an invalid payload directly to `/api/auth/register` returned `HTTP 201 Created` because the endpoint lacked server-side checks. Client validation provides instant user feedback and reduces unnecessary network roundtrips for honest users, but provides **zero security boundary** against automated tools, bots, or malicious actors.

---

### 7. What security checks belong in the frontend, and what must the server enforce regardless?
**Frontend:** The frontend should provide immediate format guidance, prevent accidental empty submissions, mask sensitive inputs, avoid rendering format hints that leak keyspace information, and encode dynamic data in the DOM to prevent Cross-Site Scripting (XSS).
**Server:** The server must enforce **everything** independently: authentication, session state verification, authorization and ownership checks (`WHERE customer_id = ?`), strict schema validation with string upper bounds, credential hashing, rate limiting, breached-password checks, and business rule transactions. The server must operate under zero trust, treating all incoming request bodies, headers, and query strings as hostile untrusted inputs.

---

### 8. The user interface hides the delete button for non-administrators. Is that enough? If not, what does an attacker do instead?
No. Hiding a button only suppresses a visual element in the client's rendered DOM. The underlying HTTP route handler (e.g. `DELETE /api/orders/123` or `POST /api/admin/delete`) remains fully exposed on the network. An attacker simply discovers the route by inspecting client JavaScript bundles, observing network traffic, or guessing REST endpoints, and sends direct HTTP requests using `curl` or browser DevTools. To secure the system, the server route itself must inspect the caller's authenticated session, verify their role in the database, and return `HTTP 403 Forbidden` if they lack delete authorization.

---

### 9. What is the difference between validation, encoding and sanitisation?
- **Validation** checks incoming data against an expected format, schema, type, and length, **rejecting** invalid requests outright (`400 Bad Request`) rather than attempting repair (e.g. rejecting a phone number that lacks 11 digits).
- **Sanitisation** modifies untrusted input by stripping or transforming unsafe elements (e.g. trimming whitespace, converting email to lowercase, or removing `<script>` tags from rich text) while retaining allowed content.
- **Encoding** translates data safely for a specific output interpreter without changing the underlying value (e.g. HTML entity encoding `&lt;` before rendering text in HTML, or parameterized SQL queries where input is treated strictly as literal data).

---

### 10. Why would you replace the incoming request body with the parsed and validated data rather than leaving both available?
Leaving the raw incoming `request.json()` object accessible alongside validated data creates a dangerous attack surface known as **mass assignment** or parameter pollution. Downstream handlers or ORM calls might inadvertently read unvalidated properties from the raw body (such as `role: "admin"` or `emailVerified: true`). By enforcing "parse, don't validate", Zod produces a brand-new, clean, strongly-typed data object containing only explicitly permitted fields with whitespace trimmed and case normalized, while discarding unknown or hostile input properties entirely.

---

### 11. Why validate route parameters and query strings, not just the body?
HTTP route parameters (e.g. `/api/orders/[id]`) and query strings (`?mode=`, `?page=`, `?filter=`) are fully controlled by the caller and enter the application runtime directly. Unvalidated route parameters can cause Insecure Direct Object Reference (IDOR) attacks, integer overflow, path traversal, or SQL injection if interpolated into queries. Unbounded query parameters (such as `?limit=9999999`) can trigger full-table memory exhaustion or Denial of Service. In our `/auth` route, `searchParams.mode` must be constrained strictly to the enum `'signup' | 'login' | 'reset'` to prevent state corruption.

---

### 12. How do you rate limit unauthenticated requests, and what is the problem with the header you would reach for first?
Unauthenticated requests are rate-limited by tracking request frequency keyed on the client's public IP address. The first header developers reach for is **`X-Forwarded-For`** (or `X-Real-IP`). The critical problem is that **HTTP headers are trivial to spoof**: unless your application sits behind a trusted reverse proxy (like Cloudflare or AWS ALB) that strips and overwrites untrusted client headers, an attacker can supply arbitrary IP strings in `X-Forwarded-For` on every request, completely resetting their rate limit bucket on every attempt.

---

### 13. Which rate limiting algorithm would you choose for a production API, and what is the boundary burst problem?
For a production API, the **Token Bucket** (or Sliding Window Counter) algorithm is preferred. In a naive Fixed Window algorithm, the **boundary burst problem** occurs when an attacker consumes their full request quota (e.g. 5 requests) at the very end of window one (second 59) and immediately consumes another full quota at the start of window two (second 60). This allows a $2\times$ traffic burst (10 requests within 2 seconds) that can overwhelm downstream databases. Token Bucket smooths bursts by replenishing tokens continuously at a steady rate.

---

### 14. Why use a shared store for your counters rather than in-memory counters on each server?
In modern production environments with load-balanced servers, container clusters (Kubernetes/ECS), or serverless instances, in-memory counters are local to a single Node.js process. An attacker targeting a cluster of 10 instances gets their rate limit multiplied by 10, because round-robin load balancers distribute requests across different server memories. Furthermore, container restarts and deployments wipe in-memory counters instantly. A centralized shared store (like Redis) ensures that request counts are synchronized globally across all instances and persist reliably.

---

### 15. What HTTP status code should a rate limiter return, and why is 403 the wrong choice?
A rate limiter must return **`HTTP 429 Too Many Requests`**, accompanied by standard rate limit headers: `Retry-After: <seconds>`, `X-RateLimit-Limit`, and `X-RateLimit-Remaining: 0`.
**`HTTP 403 Forbidden`** is the wrong choice because 403 communicates permanent authorization denial: the server understood the request, but the client does not have permission, and repeating the request will not succeed. `429` explicitly informs the client that the restriction is temporary, caused by request frequency, and provides the exact duration to wait before retrying.

---

### 16. What do you do when your rate limit store is unavailable: fail open or fail closed? Answer for your own application specifically.
- **Fail closed:** Deny all incoming requests when the rate limit store is down. Used in high-stakes financial trading or high-volume payment APIs to prevent systemic abuse.
- **Fail open:** Allow requests through without rate limit enforcement while logging alerts.
**For Fresh Fold Laundry, we fail open.** Fresh Fold is a neighbourhood laundry portal serving real customers like Amaka Obi picking up clean garments. If our rate limiting store suffers an outage, failing closed would lock out legitimate customers from checking their dockets or registering on busy counter days. Core database constraints and Argon2id hashing protect data integrity while alerts notify engineering to restore the store.

---

### 17. You have two timing numbers for hashing from your own machine. Walk me through what they mean for an attacker who has stolen your user table.
On our machine, single-thread hashing times measured:
- **Argon2id ($m=64\text{ MiB}, t=3$):** **`85.904 ms/hash`** ($\approx \mathbf{11.64\text{ hashes/sec}}$)
- **SHA-256:** **`0.000447 ms/hash`** ($\approx \mathbf{2,236,432\text{ hashes/sec}}$)

For an attacker with stolen hashes on this CPU, testing an 8-character password dictionary costs:
- **Under SHA-256:** The attacker tests **2.2 million passwords every second per core**. A common 100-million word dictionary takes only 45 seconds to crack.
- **Under Argon2id:** The attacker is capped at **11.6 guesses per second per core**, requiring **99 days** on the same core. More crucially, Argon2id demands $64\text{ MiB}$ of RAM per thread, preventing massive GPU parallelism.

---

### 18. How does a breached password check avoid sending the password anywhere? Explain the mechanism, then say what the naive version would leak.
We use the **$k$-Anonymity model** via Have I Been Pwned:
1. The server computes the SHA-1 hash of the password locally.
2. The server slices off **only the first 5 characters** (`prefix`) and sends `GET /range/{prefix}` over HTTPS.
3. The API returns a list of all known hash suffixes matching that 5-character bucket alongside breach counts.
4. The server compares the remaining 35 characters (`suffix`) locally in memory.

**What the naive version would leak:** Sending the full password or full hash transmits the customer's actual secret to a third party, exposing credentials in transit, vendor logs, and proxy traces, which risks bulk credential harvesting if the vendor is compromised.

---

### 19. Wrong-answer analysis: "I hash passwords with SHA-256 plus a random salt per user, which means even if the database is stolen the passwords cannot be reversed, because hashing is one-way. I also rate limit login attempts by IP, so brute force is not possible."
Every sentence has errors, ranked in order of severity:
1. **Most Severe — SHA-256 with salt is completely inadequate:** The candidate misunderstands the offline threat model. While hashing is one-way, attackers do not "reverse" hashes; they brute-force forward guesses. SHA-256 computes in fractions of a microsecond on GPUs. A salt stops rainbow tables, but does not slow down GPU dictionary attacks.
2. **Second Severe — IP rate limiting does not prevent brute force:** An attacker uses distributed botnets, residential proxies, or mobile IP cycling to bypass IP limits trivially (proved in `evidence/14-rate-limit-defeated.txt`).
3. **Misunderstood Threat Model:** The candidate conflates *online rate limiting* (protecting the live login form) with *offline database compromise* (where rate limits do not exist and algorithm speed decides survival).
