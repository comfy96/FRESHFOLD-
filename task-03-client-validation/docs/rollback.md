# Deterministic Rollback Log (`docs/rollback.md`)

*(Step 9: Roll back without hallucination — `task-03-client-validation/evidence/17-commit-list-and-rollback.txt`.)*

---

## 1. Commit List Before Rollback
A deliberate regret change (an unrequested AI chat prompt box inside the authentication form, which violates Fresh Fold Laundry's strict "no AI chatbot on ledger/auth screens" rule) was committed on top of the clean Stage 2 checkpoint:

```text
$ git log --oneline -n 6
1c0d1c5 chore: add unrequested AI chat prompt inside auth form (regret change)
2f67f2e test(task-03): record SPA, validation, accessibility, and attack evidence
6ff8ea1 fix(task-03): clear password on mode switch, scope hint to signup, add checkbox required
4dc0480 feat(task-03): fix 4 accessibility issues, add text docket input, and implement aria-disabled submit
26b9232 feat(task-03): collapse auth routes into /auth SPA and record Stage 1 pre-audit form
4d976bb feat(task-03): add separate signup, login, and reset-password pages before SPA collapse
```

---

## 2. Specific Commit ID Identified and Command Executed
- **Target clean commit ID:** `2f67f2e`
- **Command run:**
  ```bash
  git reset --hard 2f67f2e
  ```
- **Output:** `HEAD is now at 2f67f2e test(task-03): record SPA, validation, accessibility, and attack evidence` (verified in `evidence/17-commit-list-and-rollback.txt`).

---

## 3. Why Naming the Commit ID Is Safer Than Describing the Change in Words
A commit hash (`2f67f2e`) points deterministically to one exact, immutable repository snapshot, whereas telling an agent "undo the last two versions" or "remove the chat thing I added earlier" forces it to guess which commits and lines belong to the mistake. Relying on prose instead of the hash risks silently stripping unrelated accessibility or validation edits alongside the regret change, or leaving partial dead styling and imports behind.
