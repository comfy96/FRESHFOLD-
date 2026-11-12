# AGENT.md — Fresh Fold Laundry Engineering Rules

1. **Source of Truth:** Always read `task-01-design-system/docs/` and `src/styles/variables.css` before altering UI or backend architecture.
2. **Design System Enforcement:** UI components must consume Tier 2 semantic tokens (`var(--color-*)`, `var(--type-*)`, `var(--shadow-*)`) exclusively. Never use raw hex literals, raw `rgb()`/`rgba()`, `--primitive-*` variables, or Tailwind CSS.
3. **Database Migrations (Propose-and-Stop Rule):** Agents are strictly prohibited from executing database migrations directly (`prisma migrate`, `drizzle-kit push`, or raw DDL altering live tables). Propose schema changes and stop so the human engineer runs migrations manually.
4. **Security & Secrets:** Never commit `.env` files, passwords, SMTP credentials, or API keys to Git history.
5. **Copy & Tone:** Keep interface text calm, plain, and ledger-focused ("Our records show", never "You owe").

