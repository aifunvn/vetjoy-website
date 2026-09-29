# 23. Migration Policy

> Detailed technical policy implementing
> [`21_GOVERNANCE.md`](./21_GOVERNANCE.md) Rules 1, 3, 4, and 5. Where
> `21_GOVERNANCE.md` states the rule, this document states exactly how to
> follow it.

## 1. Immutability procedure (Rule 1 in detail)

A migration file moves through exactly three states:

```
DRAFT  →  UNDER REVIEW  →  APPROVED (frozen forever)
```

- **DRAFT**: being actively written/edited as part of Architecture/
  Review/Hardening. Free to edit.
- **UNDER REVIEW**: Acceptance + Staging + Evidence are in progress. Still
  editable *in principle*, but any edit at this point invalidates any
  Staging Evidence already collected against the pre-edit version — the
  SHA-256 will no longer match, and Staging must be re-run from Section
  2 of `19_STAGING_VALIDATION_PLAN.md` against the new hash.
- **APPROVED**: Founder has completed Founder Review
  (`21_GOVERNANCE.md` stage 7) and authorized Production. From this
  instant, the file is frozen. This is exactly what happened to
  `20260801120000_organizations_foundation.sql` at the "Sprint 1.5
  HARDENING — APPROVED" decision.

**To change something in an APPROVED migration**: write a new migration
file with a new, later timestamp that uses `ALTER TABLE`, `CREATE OR
REPLACE FUNCTION`, `DROP POLICY ... ; CREATE POLICY ...`, etc. against
the existing objects. That new file goes through the full 8-stage
pipeline itself, from Architecture onward — it is not a shortcut or a
"small patch" exception. There is no size threshold below which this
requirement is waived.

**If a genuine defect is found in an APPROVED, already-Production-applied
migration**: this is the same procedure (a new corrective migration), not
a rollback of the original — see `16_ORGANIZATIONS_MIGRATION_REVIEW.md`
"Rollback plan" step 2 for why reverting a foundation migration after
real data exists is treated as a last resort, not a routine fix.

## 2. Required artifact bundle (Rule 3 in detail)

Every migration ships with exactly these six artifacts before it may
reach Founder Review. The table below maps each requirement to its
Sprint 1.5 reference example:

| # | Artifact | Contains | Sprint 1.5 example |
| --- | --- | --- | --- |
| 1 | Review Doc | Design rationale, decision-by-decision, including anything caught and fixed during Hardening | `16_ORGANIZATIONS_MIGRATION_REVIEW.md` |
| 2 | Acceptance Checklist | Manual, human-executed verification steps, organized by category (schema, FK, RLS, cross-tenant, etc.) | `17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md` |
| 3 | Acceptance SQL | Automated, read-only assertions (`information_schema`/`pg_catalog` only — never writes real data), PASS/FAIL per check + summary | `organizations_foundation_acceptance.sql` |
| 4 | Rollback Plan | Conditional, non-destructive, kept in the Review Doc (not embedded as a runnable script in the migration itself) | `16_ORGANIZATIONS_MIGRATION_REVIEW.md` "Rollback plan" section |
| 5 | SHA-256 | Computed at Staging, re-verified at Production; a mismatch halts the pipeline | Recorded in `19_STAGING_VALIDATION_PLAN.md` §2 and re-checked in `20_PRODUCTION_ACCEPTANCE_PLAN.md` §1 |
| 6 | Evidence | Durable record proving Staging/Production actually happened — logs, timestamps, names | `19_STAGING_VALIDATION_PLAN.md` §4 and `20_PRODUCTION_ACCEPTANCE_PLAN.md` §4 |

A migration missing any of these six is not eligible for Founder Review,
regardless of how confident the SQL itself looks.

## 3. File naming and location

### Migration SQL files

`supabase/migrations/<YYYYMMDDHHMMSS>_<short_description>.sql` — the
Supabase-CLI-standard timestamp-prefixed naming, exactly as
`20260801120000_organizations_foundation.sql` already does. (The older
`0001_init.sql` predates this convention — see
`16_ORGANIZATIONS_MIGRATION_REVIEW.md`'s naming-convention note; new
migrations always use the timestamp format going forward, no exceptions.)

### Acceptance SQL files

`supabase/tests/<same_short_description>_acceptance.sql` — one per
migration, named to match its migration file's description so the pairing
is obvious from the filename alone.

### Companion documents — new convention starting with the *next* migration

Sprint 1.5's four companion docs were numbered sequentially at the top
level of `docs/` (`16` through `20`, plus `21`–`25` for this governance
layer). That flat numbering does not scale — a project targeting 46
tables across many future Sprints would run the top-level `docs/`
numbering into the hundreds and make it hard to see which numbered file
belongs to which migration.

**From the next migration onward**, per-migration companion documents
live in a dedicated subfolder instead of the flat top-level sequence:

```
docs/migrations/<same_short_description>/
  REVIEW.md
  ACCEPTANCE_CHECKLIST.md
  STAGING_VALIDATION_PLAN.md
  PRODUCTION_ACCEPTANCE_PLAN.md
```

with the Acceptance SQL staying under `supabase/tests/` (SQL belongs near
other SQL, not inside `docs/`). The **shared, cross-Sprint reference
documents** (`01`–`15`, and this governance layer `21`–`25`) keep their
existing flat top-level numbering — only *per-migration* artifacts move
to the new `docs/migrations/<name>/` convention. `16`–`20` are not
renamed retroactively (that would violate Rule 1's spirit for documents
that are themselves evidence of what Sprint 1.5 actually did); they
remain as the historical/reference example this policy is built from.

### Bootstrap-style runbooks

A migration that requires a manual one-time operational procedure (like
`18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`) includes it as an additional file
in that migration's folder (`docs/migrations/<name>/BOOTSTRAP_RUNBOOK.md`)
if one is needed — not every migration will need one.

## 4. One migration per Sprint (Rule 4) — handling dependencies

Sprints frequently depend on earlier Sprints' tables already existing
(e.g. Sprint 2's `customers` table will reference Sprint 1.5's
`organizations`). This is expected and fine — a migration may freely
`references public.organizations (id)` against a table an earlier,
already-approved migration created. What is **not** fine is putting
Sprint 1.5's and Sprint 2's table definitions in the *same file* just
because they're related. Two Sprints, two files, applied in order,
each with its own full artifact bundle.

If, during Architecture for a later Sprint, it becomes clear an earlier
Sprint's migration was missing something the later Sprint needs, the
fix is a new corrective migration (per Section 1 above) that runs
*before* the later Sprint's migration in timestamp order — never a
retroactive edit to the earlier file.

## 5. One Sprint, one migration (Rule 5) — when splitting is allowed

Splitting a single Sprint's work across multiple migration files is
permitted only when a hard technical ordering requirement exists that
cannot be satisfied by careful statement ordering *within* one file (the
approach `20260801120000_organizations_foundation.sql` itself uses
throughout — tables, then triggers, then helper functions, then RLS
policies, then grants, then seed data, all in one file in dependency
order). If splitting is genuinely required, each resulting file still
carries its own full Section 2 artifact bundle and its own Founder
Review — a split Sprint is not an excuse to share one Review Doc across
multiple files.

## 6. SHA-256 policy

- Computed once, immediately after a migration file is considered final
  for Staging (end of the Hardening stage).
- Recorded in that migration's Evidence artifact at Staging.
- Recomputed and compared at the start of Production readiness checks
  (`20_PRODUCTION_ACCEPTANCE_PLAN.md` §1) — any mismatch halts the
  pipeline and routes back to Staging with the corrected/actual file.
- Command: `sha256sum <file>` (Linux/macOS/Git Bash) or
  `Get-FileHash <file> -Algorithm SHA256` (PowerShell). Either is
  acceptable as long as the same file produces the same recorded hash
  both times.

## 7. Evidence retention policy

- Evidence packages (logs, hashes, timestamps, sign-off checklists) are
  **not** committed into this public-facing website repository — they
  may contain infrastructure details (project refs, internal test data
  descriptions) not appropriate for a public repo's history.
- Store them in whatever durable internal location Founder designates
  (shared drive, internal wiki, a separate private ops repository) — the
  requirement is durability and reviewability, not a specific tool.
- Retain evidence for the lifetime of the migration it documents — i.e.
  indefinitely, since an approved migration is never removed from the
  schema's history even if later superseded by a corrective migration.
- If a migration's Staging run failed and was corrected before
  Production, retain the failed run's evidence too (with a note of what
  was wrong and how it was fixed) — the failure is part of the record,
  not something to discard once resolved.

## File liên quan

- Governance rules this implements: [`21_GOVERNANCE.md`](./21_GOVERNANCE.md)
- Day-to-day workflow: [`22_DEVELOPMENT_WORKFLOW.md`](./22_DEVELOPMENT_WORKFLOW.md)
- Reference example this policy is built from: `16`–`20` and
  `supabase/migrations/20260801120000_organizations_foundation.sql`
