# Password Hashing & Hardware Timing Analysis (`docs/hashing.md`)

*(Step 4: Choosing Argon2id over SHA-256, proving unique salting, and measuring hardware cracking cost on this machine.)*

---

## 1. Algorithm Choice: Argon2id
Fresh Fold Laundry hashes both `password` (`password_hash`) and counter claim PIN (`claim_pin_hash`) using **Argon2id** (`argon2.argon2id`, $m = 65536\text{ KiB}$ ($64\text{ MiB}$ RAM), $t = 3$ iterations, $p = 1$ lane) via `src/lib/security/password.ts`. Neither SHA-256, SHA-512, nor MD5 is used anywhere for stored credentials.

---

## 2. Same Password Hashed Twice (`evidence/07-hash-twice-different.txt`)
Running `argon2.hash` twice on the exact same input (`AmakaShirtWash400!`) produced two completely different PHC strings:
- **Run 1:** `$argon2id$v=19$m=65536,t=3,p=1$2amUjMQUiBe9kkNoVdEMNQ$J6e6m96yUKZFc8Bg7wanEEdrXK8sYPxnkuKvashyGgQ`
- **Run 2:** `$argon2id$v=19$m=65536,t=3,p=1$5LBVnuCCBRuuHLdkK03N3Q$xVGkizKxx5a5s6AIcKCAKqRhyFxRohsaIBoGnud6GW8`

They differ because `argon2.hash` automatically generates a unique 16-byte cryptographically random salt per call (base64-encoded in the 4th `$`-delimited field) before running memory-hard mixing.

---

## 3. Hardware Timing & Guesses-Per-Second Arithmetic (`evidence/08-timing-argon-vs-sha.txt`)
Measured directly on this machine (`darwin arm64`, Node `v26.13.0`):
- **Argon2id average (5 runs):** `85.904 ms/hash`
- **SHA-256 average (100,000 runs, `44.714 ms` total):** `0.000447 ms/hash`

Single-core guesses per second:
$$\text{Argon2id} = \frac{1000\text{ ms}}{85.904\text{ ms}} = \mathbf{11.64\text{ hashes/sec}}$$
$$\text{SHA-256} = \frac{1000\text{ ms}}{0.000447\text{ ms}} = \mathbf{2,236,432\text{ hashes/sec}}$$

On this single CPU core alone, SHA-256 is **~192,118 times faster** than Argon2id—and unlike Argon2id's $64\text{ MiB}$ RAM requirement, SHA-256 scales linearly across thousands of cheap GPU cores to billions of guesses per second.

---

## 4. The Cost Inversion & Salting Trade-Off
- **The inversion:** Our server hashes one password once when Amaka logs in (`~86 ms`, invisible compared to mobile network latency), whereas an offline attacker who steals the `customers` table must guess billions of combinations against every account. Deliberately spending `~86 ms` and `64 MiB` per check costs our legitimate user nothing noticeable while multiplying the attacker's electricity, RAM, and time bill by hundreds of thousands of times.
- **What salting does:** A unique per-row random salt guarantees two customers who choose the same weak password store completely different digests, destroying precomputed rainbow tables and preventing one dictionary sweep from cracking every matching row in parallel. Argon2 handles random salt generation and verification parsing automatically inside the hash string; skipping salting would expose identical digests across reused passwords and let attackers reuse one lookup table for all accounts.
