# 22. Development Workflow

> Practical, day-to-day companion to
> [`21_GOVERNANCE.md`](./21_GOVERNANCE.md). That document says *what the
> rules are*; this document says *what you actually do* to follow them.

## Two kinds of change in this repository

| Kind | Examples | Governed by |
| --- | --- | --- |
| **Website/application code** | Pages, components, forms, services, tests in `src/` | `07_DEPLOYMENT.md`, `08_QA_CHECKLIST.md` (existing, unchanged) |
| **Database change** | Anything under `supabase/migrations/`, `supabase/tests/`, RLS policies, Storage bucket policies | `21_GOVERNANCE.md`'s 8-stage pipeline (this document walks through it step by step below) |

A single piece of work can involve both (e.g. Sprint 2 will eventually
add real Supabase-backed data *and* update `product-service.ts` to read
from it) — when it does, the database portion completes its full
pipeline (through Founder Review and, when Founder chooses, Production)
independently of the code portion, which follows the normal website
workflow. Do not let an in-progress database migration block an
unrelated website change, and do not fold a website change into a
database migration's artifact bundle.

## Website/application code workflow (unchanged from Phase 1/1.5)

1. Make the change in `src/`.
2. Run the existing quality gate:
   ```bash
   npm run lint
   npm test
   npm run build
   ```
3. For UI changes, verify in a real browser per
   `08_QA_CHECKLIST.md` (responsive, accessibility, the 5 required user
   flows).
4. Only commit when Founder has explicitly approved that commit in the
   current session (Governance Rule 6) — see
   `24_RELEASE_PROCESS.md` for the exact commit checklist.

Nothing about this changes under Governance V1 — it was already the
practice through Phase 1/1.5.

## Database change workflow — walking the 8-stage pipeline

This is what actually happens at each stage of
`21_GOVERNANCE.md` Rule 2, in the order you do it:

### 1. Architecture

- Identify which tables/policies/functions this Sprint's slice of work
  needs (cross-check `docs/12_SUPABASE_SCHEMA.md` for the full 46-table
  target design — a Sprint's Architecture stage should be "here is the
  subset we're building now and how it fits the whole", not a fresh
  redesign each time).
- Update or add architecture notes if this Sprint reveals something the
  original full-schema design got wrong or left ambiguous. Prefer
  amending the *shared* reference docs (`11`, `12`, `13`) when the change
  is a genuine correction; keep Sprint-specific reasoning in that
  Sprint's own Review Doc (next stage) instead of cluttering the shared
  reference.
- Output: a short, explicit statement of scope — "this migration covers
  tables X, Y, Z and policies A, B" — before any SQL is written.

### 2. Review

- Write the actual migration SQL (see `23_MIGRATION_POLICY.md` for file
  naming/location).
- Write a Review Doc alongside it, following the shape of
  `16_ORGANIZATIONS_MIGRATION_REVIEW.md`: explain *why* each non-obvious
  decision was made, not just what the SQL does. A reviewer six months
  from now with zero memory of this conversation should be able to read
  the Review Doc and understand the reasoning without reverse-engineering
  SQL comments.

### 3. Hardening

- Before anyone runs anything, do an adversarial self-review pass
  specifically hunting for:
  - Privilege escalation paths (can a lower-privileged role grant itself
    more access through some table this migration touches?)
  - RLS recursion (does a policy on table X query table X again under
    its own restricted privileges?)
  - Missing `search_path` on any `SECURITY DEFINER` function
  - Table-level grants wider than what any policy actually needs
  - Any `USING (true)` / `WITH CHECK (true)`
  - Cross-tenant leakage — every org-scoped table's policies checked
    against `organization_id`
- Record what was found and fixed directly in the Review Doc (see how
  `16_ORGANIZATIONS_MIGRATION_REVIEW.md` documents the two real bugs
  caught during Sprint 1.5's hardening pass — that transparency is the
  point, not something to omit because it makes the first draft look
  imperfect).

### 4. Acceptance

- Write a manual Acceptance Checklist (shape:
  `17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md`) covering schema, FK,
  unique, RLS, cross-tenant denial, and anything specific to this
  Sprint's tables.
- Write an automated, read-only Acceptance SQL script (shape:
  `organizations_foundation_acceptance.sql`) that asserts PASS/FAIL for
  everything that *can* be checked mechanically via
  `information_schema`/`pg_catalog`, ending in a `total_checks` /
  `passed_checks` / `all_pass` summary.
- This stage produces artifacts; it does not yet touch any real
  database.

### 5. Staging

- Follow the shape of `19_STAGING_VALIDATION_PLAN.md`: apply the
  migration to a real (disposable) Supabase project, run both Acceptance
  artifacts against it for real, including any live-session tests that
  can't be automated in read-only SQL.
- A migration that hasn't been proven on Staging does not proceed,
  regardless of how confident the Review/Hardening stages were.

### 6. Evidence

- Collect hashes, logs, timestamps, and names into a durable record (see
  `19_STAGING_VALIDATION_PLAN.md` Section 4 and
  `20_PRODUCTION_ACCEPTANCE_PLAN.md` Section 4 for exactly what belongs
  in this record).
- This is what Founder actually reviews in the next stage — not a verbal
  "it worked", an inspectable package.

### 7. Founder Review

- Founder reviews the Evidence package and either authorizes proceeding
  to Production or sends the migration back to an earlier stage with
  specific feedback.
- This is a human decision, not something an assistant/agent can grant
  itself or infer as implied.

### 8. Production

- Only Founder executes this stage (Governance V1, Roles table).
- Follow `20_PRODUCTION_ACCEPTANCE_PLAN.md` exactly — readiness checks,
  the migration run itself, re-running Acceptance against Production,
  and recording Production-specific Evidence.

## How AI assistants/agents participate in this workflow

- **May do, unsupervised**: draft Architecture notes, write migration
  SQL, write Review/Acceptance/Rollback docs, run the automated
  Acceptance SQL against a Staging project when explicitly asked to,
  perform static/manual review of SQL syntax and logic.
- **May do, only with explicit in-session instruction**: propose that a
  specific commit be made (but never execute `git commit`/`git push`
  without that instruction — see `24_RELEASE_PROCESS.md`).
- **May never do, under any instruction**: run SQL against a Production
  Supabase project; edit a migration file that has already reached
  Founder-approved status (Governance Rule 1); commit or push without
  explicit approval in that same session; treat a prior session's
  approval as standing permission for a new, different action.

## What counts as a "Sprint" for Rule 4/5 purposes

A Sprint, in the Governance V1 sense, is the smallest coherent slice of
the 46-table target schema (`12_SUPABASE_SCHEMA.md`) that can be
migrated, reviewed, and accepted as one unit without leaving obviously
dangling references. `docs/BACKLOG_PHASE2.md` already lays out this
Sprint breakdown (Sprint 1.5 = organizations foundation; Sprint 2 =
identity/customer core + `events`; Sprint 3 = catalog/inventory; etc.) —
that backlog **is** the Sprint boundary definition for Governance
purposes. If a future planning session wants to change how work is
sliced into Sprints, update `BACKLOG_PHASE2.md` first; Rule 4/5 then
apply to whatever the updated Sprint boundaries say.

## File liên quan

- Governance rules: [`21_GOVERNANCE.md`](./21_GOVERNANCE.md)
- Migration artifact detail: [`23_MIGRATION_POLICY.md`](./23_MIGRATION_POLICY.md)
- Commit/release checklist: [`24_RELEASE_PROCESS.md`](./24_RELEASE_PROCESS.md)
- Sprint breakdown: [`BACKLOG_PHASE2.md`](./BACKLOG_PHASE2.md)
