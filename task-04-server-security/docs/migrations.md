# Migrations Run Deliberately (`docs/migrations.md`)

*(Step 3: Forward-only discipline, immutable migrations, and the propose-and-stop rule.)*

---

## 1. Why Forward-Only Migrations
In production databases, data moves in one direction: forward in time. Traditional "down" rollback migrations are a dangerous illusion because schema changes often destroy data reversibility:
- Dropping a column (`DROP COLUMN`) deletes historical data permanently. Running a "down" migration re-creates an empty column, but the data is gone.
- Splitting a column (e.g. `full_name` $\rightarrow$ `first_name, last_name`) or transforming data formats cannot be mathematically inverted without data loss.
- In distributed deployments where application code and database schema deploy at slightly different seconds, a "down" migration causes immediate runtime crashes on servers running the newer code.

**Forward-only discipline** states that every migration is an additive, forward-moving delta. If a migration introduces a bug or unneeded column, you do not roll the migration back in place; you write a *new* forward migration that deprecates, transforms, or cleans up the state safely.

---

## 2. Why You Never Edit a Migration That Has Already Run
Once a migration script (e.g. `20261114062612_init/migration.sql`) has executed against any environment—a colleague's laptop, staging, or production:
1. **Checksum divergence:** ORMs like Prisma record a cryptographic SHA-256 hash in the `_prisma_migrations` table (`checksum` column). Editing the file on disk creates a checksum mismatch, halting future CI/CD deployments with a fatal drift error.
2. **Invisible schema inconsistency:** Modifying an old migration file only affects databases created *after* the edit. Existing databases that already ran the old script remain unchanged, creating silent, unreproducible schema drift between developer machines and production.

---

## 3. Why Run Migrations by Hand Rather Than Letting an Agent Do It
AI agents are excellent at generating draft SQL and proposing schema changes from specifications, but agents must never execute migrations directly in production or staging.
- **Irreversible data loss:** An agent optimizing for a concise schema will happily approve destructive operations (e.g., table recreation, dropping populated columns, or truncating data) when an unexpected constraint conflict arises.
- **The Propose-and-Stop Rule:** The agent drafts `schema.prisma`, generates the migration SQL diff, and **stops**. A human engineer reviews the DDL, inspects the table data count, plans backfill steps, and executes the migration manually.

---

## 4. The Honest Cost of Running Migrations by Hand
Running migrations manually carries real friction:
- **Velocity bottleneck:** Every database change requires a human checkpoint, slowing down automated deployment pipelines and rapid prototyping.
- **Human error and forgetfulness:** Humans forget to run migrations before testing, forget to execute the backfill step in the middle of a three-step migration, or run migrations in the wrong order when switching branches. Automated schema checks (`prisma migrate status`) in CI and startup health checks are required to catch forgotten manual steps.
