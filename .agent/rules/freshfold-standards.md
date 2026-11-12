# Fresh Fold Workspace Rules

- **Scope Control:** Build only what the current task phase authorizes. Do not generate unrequested auth handlers, chatbots, or speculative dashboards.
- **No Hardcoded Styles:** All CSS files under `src/app/` must map colors, typography, and elevation directly to `src/styles/variables.css`.
- **No Agent-Executed Migrations:** Propose schema edits and wait for manual migration execution.
- **Defect Honesty:** Record real defects with exact file paths and line numbers rather than hiding them.

