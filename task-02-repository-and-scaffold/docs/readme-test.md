# README Fresh-Clone Test (`docs/readme-test.md`)

*(Task 02 Step 7 Requirement: Give `README.md` to someone who has never seen this project, record verbatim what they got stuck on, and fix the README.)*

---

## 1. Automated Pre-Flight Gap Caught Before Human Hand-Off
While walking through `README.md` Section 4 ("Getting started") as a new maintainer:
- **Sticking Point Found:** `README.md` originally gave `git clone`, `npm install`, `cp .env.example .env`, `npm run dev` without stating the **Node.js `v22.5+` minimum requirement**. Because `src/lib/db.ts` imports Node's built-in `node:sqlite` module, any developer running Node 18 or Node 20 LTS hits `ERR_UNKNOWN_BUILTIN_MODULE: No such built-in module: node:sqlite`.
- **README Fix Applied:** Added the explicit `Node.js v22.5+ (tested on v26.13.0)` prerequisite and `node -v` check at the top of `README.md` Section 4.

---

## 2. Live Human Tester Onboarding Log *(Complete With Real Tester)*
- **Tester Name / Background:** `<Enter name & role of person who tested README.md>`
- **Date Tested:** `<YYYY-MM-DD>`
- **What They Got Stuck On (Verbatim):**
  > `"<Paste exact quote of what confused or blocked them while following README.md from a fresh clone>"`
- **Fix Applied to `README.md` After Their Feedback:**
  - `<Describe exact line/command updated in README.md to resolve their blocker>`

