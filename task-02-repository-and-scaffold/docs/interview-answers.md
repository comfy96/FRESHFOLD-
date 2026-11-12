# Interview Defence — Task 02: Repository, Scaffold & Diagnostics

*(Strict limit: Maximum 200 words per answer.)*

---

### 1. What is the difference between Git Flow and trunk-based development, and why have a lot of teams moved toward trunk-based?
**Git Flow** maintains multiple long-lived branches—typically `main` (production), `develop` (integration), plus long-running `feature/*`, `release/*`, and `hotfix/*` branches. **Trunk-based development (TBD)** keeps a single primary branch (`main`/`trunk`) that stays continuously deployable, with developers integrating short-lived feature branches (lasting hours or 1–2 days) via Pull Requests and feature flags.

Teams have moved away from Git Flow toward trunk-based development for three main reasons:
1. **Merge Hell:** Long-lived `feature` and `develop` branches drift apart over weeks, turning merges into risky, multi-hour conflict resolutions.
2. **CI/CD Friction:** Continuous deployment struggles when releases must pass sequentially through `develop` $\rightarrow$ `release` $\rightarrow$ `main` ceremonies instead of shipping verified incremental commits.
3. **Batch Risk:** Trunk-based small PRs expose integration bugs within hours when the context is fresh, whereas Git Flow batches weeks of changes into brittle release cycles.

---

### 2. What does `git push --force` actually do, and why is `--force-with-lease` generally safer?
A normal `git push` requires a **fast-forward** update: the remote branch pointer must be a direct ancestor of your local commit. **`git push --force`** disables that safeguard and unconditionally overwrites the remote branch pointer with your local commit hash, deleting any commits pushed to the remote by teammates since your last pull.

**`git push --force-with-lease`** performs a compare-and-swap check before overwriting: it verifies that the remote branch currently points to the exact commit hash your local tracking ref (`origin/branch`) expects. If a teammate pushed a new commit to the remote in the meantime, `--force-with-lease` **aborts with a rejection** instead of silently erasing their work. It only permits overwriting history you already knew existed.

---

### 3. Why is rewriting history, through rebase, amend or force push, dangerous on a shared branch?
Commands like `git rebase`, `git commit --amend`, and `git push --force` do not modify commits in place—they **create brand-new commit objects with different SHA-1/SHA-256 hashes** and abandon the old commits.

On a shared branch, rewriting history breaks every collaborator’s local repository:
1. **Diverged Timelines:** Teammates who pulled the original commit hashes now hold a branched local history that shares no clean linear tip with `origin`. When they run `git pull`, Git attempts to merge the old history back into the rewritten history, creating duplicate commits and confusing conflict markers.
2. **Lost Work:** If someone force-pushes over a shared branch, teammates’ subsequent pushes or unpulled commits can become orphaned in reflog or permanently overwritten if they mistakenly force-push back.

Rule of thumb: rewrite freely on private local feature branches (`feat/information-design`), never on `main` or any branch someone else has checked out.

---

### 4. What is the difference between `git merge` and `git rebase`, and when would you actually pick one over the other?
**`git merge`** combines two diverged branches by creating a new **merge commit** with two parent pointers, preserving the exact historical topology of when branches split and rejoined without altering any existing commit hashes.

**`git rebase`** lifts your branch’s commits and replays them sequentially on top of a new base commit (e.g., updating `feat/information-design` onto the latest `main`), rewriting commit hashes to produce a flat, linear timeline.

- **Pick `git rebase`** locally on a private feature branch before opening a Pull Request so your branch incorporates upstream fixes cleanly without noisy "Merge branch main into feat/..." commits.
- **Pick `git merge`** (`--no-ff`) when landing a Pull Request onto `main` or integrating shared team branches, because preserving the exact branch boundary makes reverting an entire feature in one commit trivial and avoids rewriting shared history.

---

### 5. What causes a merge conflict, and what is actually happening in the file when you see the conflict markers?
A merge conflict occurs when **two branches modify overlapping lines in the same file** (or one deletes a file the other modifies) since their common ancestor commit, leaving Git unable to deterministically pick one change over the other.

When Git halts and inserts conflict markers into your working-tree file, it has temporarily paused the merge/rebase and written both competing versions side-by-side into the plain text file:
- `<<<<<<< HEAD` down to `=======`: the exact lines currently on your checked-out branch (`HEAD`).
- `=======` down to `>>>>>>> branch-name`: the incoming lines from the branch being merged or rebased.

The file in the working directory is not broken metadata—it is ordinary text waiting for a human to choose, combine, or rewrite the lines, strip all three marker lines (`<<<<<<<`, `=======`, `>>>>>>>`), stage the resolved file (`git add`), and complete the commit.

---

### 6. What is the difference between the working directory, the staging area and the repository?
Git separates file changes across three distinct zones:
1. **Working Directory:** The checked-out files sitting directly on disk (`src/app/page.tsx`) that your editor and compiler read and modify. Changes here are untracked or unstaged.
2. **Staging Area (Index):** A binary snapshot file (`.git/index`) holding the exact file versions you chose via `git add` to include in the *next* commit. It lets you split messy edits into clean, atomic commits (for instance, staging `.gitignore` separately from `.env.example`).
3. **Repository (`.git/objects` & refs):** The permanent local commit database storing immutable commit snapshots, trees, blobs, and branch pointers (`main`, `HEAD`) created by `git commit`.

Understanding these three zones prevents disasters—such as leaving secrets in the working directory while keeping them out of staging and repository history.

---

### 7. What is branch protection, and what does it typically enforce?
Branch protection is a repository-level server policy (on GitHub, GitLab, etc.) that prevents direct, unchecked mutations to critical branches like `main` or `production`.

Typically, branch protection rules enforce:
1. **No direct pushes:** All changes must arrive through a Pull Request (`feat/information-design` $\rightarrow$ `main`).
2. **Required peer reviews:** At least $N$ approvals from code owners before merging, blocking self-merges in team setups.
3. **Required status checks:** Automated CI suites (TypeScript `tsc --noEmit`, unit tests, build checks, secret scanners) must pass on the latest commit before the merge button unlocks.
4. **No force-pushes or branch deletion:** Prevents rewriting or erasing production history (`git push --force` rejected).
5. **Up-to-date branch requirement:** Forces PR branches to pull or rebase recent `main` changes so tests reflect true post-merge behavior.

---

### 8. Walk me through a technical project you built end to end.
I am building **Fresh Fold Laundry**, an order status and pickup ledger portal designed for Nigerian neighbourhood laundry customers on low-cost Android phones with intermittent mobile data.

1. **Design System (Task 01):** Derived a `#007B71` teal palette pinned at Primary 40 in Figma with Light/Dark variable modes and a 15-style `Plus Jakarta Sans` scale (`57/80`, `-0.25px`). Built a Node.js compiler (`build-tokens.js`) emitting `variables.css` so UI components consume semantic tokens exclusively (`07-raw-value-search.txt`).
2. **Scaffold & Persistence (Task 02):** Using phased human-reviewed prompting (`scaffold-prompt.md`), scaffolded Next.js 15 App Router + TypeScript without Tailwind. Added a local SQLite database (`node:sqlite` via `DATABASE_URL`) powering `/pickup` (`POST /api/pickup-requests` returning HTTP `201`) and `/orders` (`formatRecordDate` converting UTC rows to `WAT` `UTC+1`).
3. **Verification:** Caught and logged real defects (Light Mode `Surface_Container_Lowest` `1.31:1` contrast, silent `500` false-success UX in `PickupForm.tsx`), verified cold vs. warm load timings (`1,414 ms` $\rightarrow$ `13 ms`), and enforced PR branching with `<head>` SEO boundaries.

---

### 9. Tell me about a time when something you built broke in production.
During this build, two real failures caught us directly on `main`:

1. **Regressed Brand Tokens Committed to `main`:** While running our Task 01 deliberate token-breakage branch test (`#9E2A2B` terracotta override + hardcoded `--color-primary: #007B71`), a quick commit (`947ae61`) inadvertently landed that broken `src/styles/variables.css` directly onto `main`. Had that deployed, every primary UI token would have drifted away from our Figma palette. Inspecting `git show 947ae61` immediately caught the diff, and running `build-tokens.js` restored clean `#007B71` bindings.
2. **Silent Database Failure Showing False Success:** In `/pickup`, `PickupForm.tsx` originally displayed `"Our records show your pickup request was saved."` inside `try/catch` without checking `if (!response.ok)`. When `DATABASE_URL` was dropped, `POST /api/pickup-requests` returned `HTTP 500`, zero rows saved in SQLite, yet the browser showed green confirmation (`13-write-failed-logs.txt`). Fixing `response.ok` handling and inspecting HTTP `201` logs resolved both.

---

### 10. How do you approach learning a new technical platform or codebase quickly when starting a new engagement?
I follow a four-step bottom-up audit before modifying any behavior:

1. **Map the Entrypoints & Manifests First:** Read `package.json`, `tsconfig.json`, environment templates (`.env.example`), and `README.md` to trace build commands, runtime versions, and declared boundaries.
2. **Boot Locally & Observe Real Logs:** Start the local dev server immediately—before editing code—and hit one happy path and one missing route (`404`) while reading stdout/stderr, HTTP status codes, and port bindings (`lsof`).
3. **Trace One Vertical Slice End-to-End:** Follow a single user action from UI event handler $\rightarrow$ API route $\rightarrow$ database file/inspector (`sqlite3 freshfold.db`) to verify whether persistence and error paths actually match what the UI claims.
4. **Verify Assumptions Against Primary Docs:** Whenever behavior surprises me—such as Next.js 15 auto-loading `.env` despite `env -u DATABASE_URL`, or streaming `<head>` metadata—I test against live output and primary docs rather than guessing.

---

### 11. What is the difference between code that is correct and code that is complete?
**Correct code** satisfies the immediate happy-path specification: it compiles cleanly (`tsc --noEmit`), executes the primary algorithm without syntax errors, and produces the expected return value on clean inputs.

**Complete code** handles reality when inputs, networks, or environments fail:
1. **Error & Failure Visibility:** In Task 02, `PickupForm.tsx` initially rendered the right green banner on a valid write—functionally "correct" in a happy-path demo—yet incomplete because it ignored `!response.ok` during a `500` database failure (`docs/false-success.md`).
2. **Operational & Environment Boundaries:** Complete code respects `DATABASE_URL` missing checks, separates secrets via `.gitignore`/`.env.example`, logs structured status transitions (`201 Created`, row ID, timestamp), and converts storage UTC to domain local time (`WAT`).
3. **Accessibility, SEO & Maintainability:** Includes `:focus-visible` outlines, dynamic `<head>` titles, `noindex` on private customer routes, and honest documentation of known defects rather than hiding incomplete edges.

---

### 12. How do you design software for a customer who will need to maintain it after you are gone?
Maintainable handoff is designed upfront through clarity, constraints, and zero hidden magic:

1. **Honest, Tested `README.md`:** Exact clone-to-running commands verified by an outsider (`docs/readme-test.md`), environment variable names (never values), explicit scope boundaries, and known defects with file/line references so the maintainer doesn’t inherit mystery bugs.
2. **Boring, Predictable Stack & Structure:** Standard Next.js App Router conventions, plain CSS Modules wired to one token source (`variables.css`), and zero over-engineered abstractions (`node:sqlite` instead of unnecessary distributed queues before needed).
3. **Single Source of Truth & Guardrails:** Encoding rules into `AGENT.md`, `.agent/rules/`, and automated build scripts (`build-tokens.js`) so future engineers or AI agents cannot drift from Figma tokens or run unsafe migrations.
4. **Plain-Language Documentation & Observable Logs:** Explicit decision logs explaining *why* choices were made (and where they break), paired with clear server logs (`201 Created row_id=...`) for fast 30-second debugging.

---

### 13. Your first page load took a specific number of milliseconds. Where did that time go? Name the parts you can measure and the parts you are guessing about.
In `evidence/04-first-load.txt`, our cold first load on `http://localhost:3000/` took **`1,414 ms`** (`1.413667s` via `curl`), dropping to **`13 ms`** (`0.013027s`) on warm reload.

**Parts directly measured from Next.js dev server & `curl` output:**
1. **On-demand route compilation (`1,252 ms` — 88.5% of total):** Next.js logged `✓ Compiled / in 1252ms (564 modules)`. Dev mode compiles routes lazily upon the first request rather than ahead of time.
2. **React Server Component render & HTML streaming (`159 ms`):** The server logged `GET / 200 in 1411ms`, leaving `1411 - 1252 = 159 ms` for first-pass RSC tree execution and HTTP serialization (`13 ms` on warm reload).
3. **Local TCP & `curl` client overhead (`~2–3 ms`):** Difference between internal `1,411 ms` and external `1,413.67 ms` (`ttfb=1.411464s`).

**Parts inferred/guessed inside the `1,252 ms` compiler bucket:** Filesystem `stat()` sweeps across `node_modules`, SWC TypeScript/JSX transpilation, and CSS Module resolution—eliminated completely in production (`next build`).

---

### 14. Your application reported success to the user while writing nothing to the database. Explain the mechanism that allowed that, and name the one check that would have caught it in thirty seconds.
Two independent disconnects combined to produce **false success** (`evidence/13-write-failed-logs.txt`):
1. **Backend configuration failure:** With `.env` removed and `DATABASE_URL` unset, `getDb()` threw `DATABASE_URL environment variable is missing or empty.`, causing `POST /api/pickup-requests` to log and return **`HTTP 500 Internal Server Error`**.
2. **Unchecked `fetch` status in the frontend:** In `src/app/pickup/PickupForm.tsx:21-38`, `handleSubmit` awaited `fetch('/api/pickup-requests', ...)` without checking `if (!response.ok)`, and set `setStatusMessage('Our records show your pickup request was saved.')` unconditionally across both `try` and `catch`. The browser suppressed the `500` JSON error and displayed a calm green confirmation box.

**The one 30-second check that catches it immediately:** Inspect the server terminal logs (or Network tab) for an explicit **`HTTP 201 Created`** (not `200` or `500`) alongside querying the database directly (`sqlite3 freshfold.db "SELECT COUNT(*) FROM pickup_requests;"`) to confirm a new row ID and timestamp actually landed on disk.

---

### 15. Wrong-answer analysis. A candidate says: "I always check my app is working by signing up a test user and confirming I get taken to the dashboard. If the dashboard loads, the backend is working." Say what is wrong with this, what it would miss, and what you would do instead.
This relies purely on **superficial UI navigation** rather than verifying persistence—the exact mistake behind the Aisha false-success failure.

**What is wrong & what it misses:**
1. **Client-side redirects without persistence:** Frontend routing (`router.push('/dashboard')`) often runs optimistically regardless of API failure, or against a mock/cached session state, taking the user to `/dashboard` after a `401`, `404`, or `500`.
2. **Silent write/schema failures:** If `DATABASE_URL` is misconfigured, an error is swallowed, or `INSERT` failed, zero user rows exist in the database—so the test user can never log in a second time or survive a reload.
3. **Empty/mock dashboard traps:** The dashboard route can render static JSX or fallback placeholders (`200 OK`) with zero real database connection.

**What I would do instead:**
Submit real distinct payloads, verify **`HTTP 201 Created`** in server logs, inspect the live database table directly (`sqlite3` / Prisma Studio) to confirm two rows with unique IDs and timestamps minutes apart, and deliberately break `DATABASE_URL` to verify the UI surfaces an error rather than false success.

