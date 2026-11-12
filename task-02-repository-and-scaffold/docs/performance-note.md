# Development Server Performance Note

*(Measurements recorded locally on macOS in `evidence/04-first-load.txt` on `http://localhost:3000/`.)*

---

## 1. Observed Timing Numbers
- **Server Ready Time:** `11.3s` (`✓ Ready in 11.3s`)
- **First Load (Cold):** **`1,414 ms`** (`curl` `time_total=1.413667s`, `ttfb=1.411464s`; server log `GET / 200 in 1411ms`, compiling `/` 564 modules in `1,252 ms`)
- **Reload (Warm):** **`13 ms`** (`curl` `time_total=0.013027s`, `ttfb=0.012153s`; server log `GET / 200 in 13ms`)

---

## 2. Gap From Target
Against a local responsiveness target of **10 ms – 50 ms** for a minimal single-card home screen, our **1,414 ms** cold load is roughly **28× to 141× slower** than target. Once compiled, the warm reload drops by **99.1%** down to **13 ms**, sitting directly within the target band.

---

## 3. What Accounts for the Gap (Measured vs Inferred)
- **Measured directly in server logs:**
  1. **On-demand route compilation (`1,252 ms` / 88.5% of total cold time):** Next.js dev mode compiles routes lazily on first request rather than upfront, bundling **564 modules** (React 19 runtime, Next.js App Router internals, CSS modules, and `variables.css`) before returning the first byte.
  2. **Post-compile React Server Component render + HTTP serialization (`159 ms`):** The remaining `1411ms - 1252ms = 159ms` covers first-pass RSC tree evaluation and response streaming.
  3. **Local TCP loopback + curl handshake overhead (`~2–3 ms`):** Difference between server log (`1411ms`) and external `curl` (`1413.67ms`).
- **Inferred / unmeasured inside the `1,252 ms` compiler bucket:** File-system stat calls across `node_modules` and TypeScript/SWC AST transformation. In production (`next build && next start`), pre-compiled static chunks eliminate that `1,252 ms` cold-compile penalty completely.
