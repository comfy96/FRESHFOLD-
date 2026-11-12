# Model Choices & Agent Comparison

## 1. Which Model for Which Job
- **Planning & Foundation Scaffolding — Antigravity (Gemini 3.8 Flash High / Reasoning Agent):**
  Chosen for Task 02 Phase 1/2 scaffolding (`docs/scaffold-prompt.md`, `package.json`, `src/app/`, `src/lib/db.ts`). Antigravity reads surrounding docs first, exposes file conflicts before writing code (`evidence/01-agent-plan.txt`), and enforces strict design-token boundaries.
- **Fast Single-File Utility — `flash_lite` Subagent:**
  Chosen for authoring `src/lib/formatRecordDate.ts` (converting ISO UTC timestamps into receipt-book dates). `flash_lite` prioritizes fast, direct tool execution (~17 seconds end-to-end) without pausing for multi-file architectural analysis.

---

## 2. Observed Behavioural Differences
1. **Context Inspection vs Immediate Output:**
   Antigravity paused before touching code and flagged 5 real discrepancies across `README.md`, `variables.css`, `scaffold-prompt.md`, and missing `.agent` rules. `flash_lite` immediately wrote `src/lib/formatRecordDate.ts` in one pass without reading `task-01-design-system/docs/business-brief.md` or `src/lib/db.ts`.
2. **Error Prevention vs Speed:**
   Antigravity’s pre-flight inspection caught the broken Light Mode `--color-surface-container-lowest` (`1.31:1` contrast) before rendering a single card, whereas `flash_lite` missed domain context completely.

---

## 3. Where I Chose Wrong and Switched
Delegating `src/lib/formatRecordDate.ts` to `flash_lite` without passing the Nigerian domain constraint explicitly produced a subtle production bug: `flash_lite` emitted raw UTC hours (`date.getUTCHours()`) and unpadded day numbers (`2 Nov 2026`). Because Fresh Fold Laundry operates in Nigeria (`WAT`, `UTC+1`), SQLite's UTC timestamps would display one hour behind actual shop time on Amaka Obi's receipt screen.

I switched back to the high-reasoning Antigravity agent to inspect `db.ts` + `business-brief.md`, append the missing `Z` UTC marker for SQLite timestamps, add the `+60 min` `WAT` offset, and zero-pad days (`02 Nov 2026, 11:46 WAT`).
