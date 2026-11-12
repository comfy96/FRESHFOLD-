# The Working Tree & Branch Discipline

*(Hand-drawn diagram submitted as `evidence/14-working-tree-drawing.jpg`; live branch graph captured in `evidence/15-git-log-graph.txt`.)*

---

## 1. What Breaks When a Tree Has Only One Branch
When every change is committed directly to `main`, four engineering safeguards collapse immediately:

1. **Zero Isolation for In-Progress Work:** Experimental refactors, broken migrations, or half-finished routes sit directly inside `main`. If an urgent bug fix is needed on production, you cannot deploy the fix without shipping unfinished work alongside it.
2. **No Review Boundary Before Public Visibility:** Every commit pushed to `origin/main` goes straight toward deployment without a Pull Request diff, automated check, or verification against a clean base.
3. **Painful Rollbacks:** Reverting a single bad feature tangled across ten direct commits on `main` requires surgical `git revert` chains instead of simply discarding or reverting one isolated branch merge.
4. **Lost Experiment History:** Discarded ideas pollute the main timeline or require risky history rewrites (`git reset --hard`) on a shared branch.

---

## 2. Why This Matters More After First Deployment Than Before It
Before first deployment, `main` is private scaffolding—a broken commit only wastes your own time while developing on `localhost:3000`.

Once Fresh Fold Laundry is deployed and real Nigerian customers like Amaka Obi rely on `/orders` and `/pickup` for their garment counts and bank transfer proof, `main` becomes **live customer truth**. Pushing an untested change directly to `main` breaks active user sessions, corrupts SQLite writes, or introduces a false-success regression in front of paying customers—where mistakes become visible publicly, erode trust instantly, and can no longer be undone quietly.

