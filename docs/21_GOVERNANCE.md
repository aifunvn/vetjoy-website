# 21. VETJOY Governance V1

> **Status: ACTIVE, effective from Sprint 1 completion (Organizations
> Foundation migration).** This is the founding governance charter for
> how VETJOY's database and infrastructure changes are proposed,
> reviewed, and released from this point forward. It codifies, as
> standing policy, the process that was followed ad hoc through Sprint 1
> and its Hardening Revision (`supabase/migrations/20260801120000_organizations_foundation.sql`
> and `docs/16`–`20`) — that process is not a one-time exercise, it is now
> the required process for every future database change.

## Why this exists

Sprint 1 produced a real, security-sensitive artifact (a multi-tenant RLS
foundation) through a process that worked: design → adversarial review →
hardening → mechanical + manual acceptance testing → staged rollout
planning → Founder authorization. That process caught two real bugs
before anything ever ran (see `16_ORGANIZATIONS_MIGRATION_REVIEW.md`
"Hierarchical visibility") precisely *because* it was rigorous. Writing
it down as governance ensures the next migration — and the one after
that — gets the same rigor by default, not by luck or by whoever happens
to remember what Sprint 1 did.

## Scope

This governance applies to **all Supabase database changes**: schema
migrations, RLS policies, database functions/triggers, and Storage bucket
policies. It does not replace or change the existing lighter-weight
process for website/frontend code changes (`docs/07_DEPLOYMENT.md`,
`docs/08_QA_CHECKLIST.md` — lint/test/build before merge) — that process
continues as-is. Where a single change touches both (e.g. a future
`product-service.ts` update that starts reading from a newly-migrated
Supabase table), the database portion follows this governance and the
code portion follows the existing website process; see
`22_DEVELOPMENT_WORKFLOW.md` for how the two interleave.

## Rule 1 — Immutable Migration

**Once a migration file has been APPROVED (a Founder Review sign-off
recorded per this governance), it must never be edited again.**

- "Approved" means Founder has explicitly signed off following the
  process in Rule 2 — not merely "written" or "reviewed by an agent".
  `20260801120000_organizations_foundation.sql` reached this state after
  the "Sprint 1.5 HARDENING — APPROVED" decision; it is frozen from that
  point forward.
- Wanting to change *anything* in an approved migration — a typo in a
  comment, a stricter CHECK constraint, an additional index — means
  writing a **new** migration file that alters the existing objects
  (`ALTER TABLE`, `CREATE OR REPLACE FUNCTION`, `DROP POLICY … CREATE
  POLICY …`, etc.), never re-opening the old file.
- This is not bureaucracy for its own sake: once a migration has been
  validated on staging (or applied to Production), its file is evidence
  — the SHA-256 hash recorded in that migration's Evidence package (Rule
  3) is only meaningful if the file behind it never changes after the
  hash was taken. See `23_MIGRATION_POLICY.md` for the full procedure.

## Rule 2 — The mandatory pipeline

**Every** database change, with no exceptions, moves through these
stages in order:

```
Architecture
     ↓
Review
     ↓
Hardening
     ↓
Acceptance
     ↓
Staging
     ↓
Evidence
     ↓
Founder Review
     ↓
Production
```

| Stage | What it means | Reference implementation from Sprint 1 |
| --- | --- | --- |
| **Architecture** | Design the schema/RLS/functions conceptually before writing SQL — ERD, table specs, relationships | `docs/11_DATABASE_ARCHITECTURE.md`, `docs/12_SUPABASE_SCHEMA.md`, `docs/13_RLS_POLICY_PLAN.md` |
| **Review** | Turn the architecture into an actual migration file, with a companion document explaining every design decision and its rationale | `supabase/migrations/20260801120000_organizations_foundation.sql` + `docs/16_ORGANIZATIONS_MIGRATION_REVIEW.md` |
| **Hardening** | Adversarial self-review pass specifically hunting for security/correctness gaps (privilege escalation, RLS recursion, missing search_path, overly broad grants) before anyone runs anything | The Sprint 1.5 Hardening Revision — cycle-detection trigger, hierarchical visibility, explicit GRANT/REVOKE, 2 real bugs caught and fixed |
| **Acceptance** | A checklist (manual) + a script (automated, read-only) that together prove the migration does what the Review doc claims | `docs/17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md` + `supabase/tests/organizations_foundation_acceptance.sql` |
| **Staging** | Apply the migration to a real, disposable Supabase project and run Acceptance against it for real | `docs/19_STAGING_VALIDATION_PLAN.md` |
| **Evidence** | Durable, reviewable proof that Staging actually passed — hashes, logs, timestamps, who/when | Section 4 of `docs/19_STAGING_VALIDATION_PLAN.md` and `docs/20_PRODUCTION_ACCEPTANCE_PLAN.md` |
| **Founder Review** | Founder personally reviews the Evidence and authorizes the next step — this is a human decision point, not a formality | Section 6 of `docs/19` and `docs/20` |
| **Production** | Founder (and only Founder) applies the migration to the real Production project, then re-runs Acceptance there | `docs/20_PRODUCTION_ACCEPTANCE_PLAN.md` |

No stage may be skipped, reordered, or combined to save time. If a
migration is small, the *artifacts* can be small — but all eight stages
still happen. See `22_DEVELOPMENT_WORKFLOW.md` for how this plays out
day-to-day, and `23_MIGRATION_POLICY.md` for exactly what artifact is
required at each stage.

## Rule 3 — Required artifact bundle per migration

Every migration must ship with all six of the following before it can
reach Founder Review:

1. **Review Doc** — design rationale (why each decision was made, not
   just what the SQL does)
2. **Acceptance Checklist** — manual, human-executed verification steps
3. **Acceptance SQL** — automated, read-only assertions with a
   PASS/FAIL + summary output
4. **Rollback Plan** — conditional, non-destructive, documented
   separately from the migration file itself (never a `DROP` script
   embedded in the forward migration)
5. **SHA-256** (of the migration file) — recorded at Staging and
   reverified at Production, to prove the exact file tested is the exact
   file applied
6. **Evidence** — the durable record that stages 4 (Staging) and 5
   (SHA-256 match) actually happened, with timestamps and names

Full detail on the shape and location of each artifact:
`23_MIGRATION_POLICY.md`.

## Rule 4 — No merging Sprints into one migration

A migration file is scoped to exactly one Sprint's worth of database
change. Two Sprints' worth of tables/policies must never land in a
single migration file, even if it would be "more efficient" to batch
them. Rationale: this is what keeps Rule 1 (immutability) and the
Evidence trail meaningful — a reviewer or Founder auditing "what changed
in Sprint 3" must be able to point at exactly one file, not have to diff
out Sprint 3's portion of a combined file.

## Rule 5 — One Sprint, one migration

The inverse of Rule 4: a Sprint should also not be *split* across
multiple migration files unless a real technical dependency requires it
(e.g. a table that must exist before a trigger referencing it can be
created — even then, prefer ordering statements within one file over
splitting files, per how `20260801120000_organizations_foundation.sql`
itself is internally ordered). Splitting a single Sprint's logical unit
of work across files defeats the same traceability goal as Rule 4, from
the other direction.

## Rule 6 — No commit without Founder approval

No migration, code change, or documentation update in this repository is
committed to git unless Founder has explicitly approved that specific
commit in that specific session. This has been standing practice since
Phase 1 (see the commit/push history in `docs/10_CHANGELOG.md` — every
commit and push in this project so far was preceded by an explicit
Founder go-ahead) and is now formal governance, not just habit. See
`24_RELEASE_PROCESS.md` for the exact commit workflow this implies.

## Roles

| Role | Can do | Cannot do |
| --- | --- | --- |
| **Founder** | Approve any stage; run SQL against Production; approve commits/pushes | — |
| **Reviewing engineer** (human, if/when one is involved) | Author Review/Hardening/Acceptance artifacts; apply migrations to Staging | Apply anything to Production; approve their own Founder Review |
| **Assistant/agent** | Design, write, and review migrations and docs; run automated Acceptance SQL against Staging when explicitly asked | Ever run SQL against Production; ever commit or push without Founder's explicit approval in that turn; ever edit an approved migration file |

## Versioning of this governance

This is **Governance V1**. Amending any rule in this document requires
the same discipline it describes: propose the change, get Founder review,
record the decision — do not silently edit this file's rules going
forward without a visible revision note (add a "Revision history"
section here the first time a rule actually changes, the same pattern
used in `16_ORGANIZATIONS_MIGRATION_REVIEW.md`).

## File liên quan

- Day-to-day workflow: [`22_DEVELOPMENT_WORKFLOW.md`](./22_DEVELOPMENT_WORKFLOW.md)
- Migration artifact requirements in detail: [`23_MIGRATION_POLICY.md`](./23_MIGRATION_POLICY.md)
- Release/commit process: [`24_RELEASE_PROCESS.md`](./24_RELEASE_PROCESS.md)
- Reusable sign-off template: [`25_FOUNDER_CHECKLIST.md`](./25_FOUNDER_CHECKLIST.md)
- Reference implementation of this entire pipeline: `docs/11`–`docs/20`
  and `supabase/migrations/20260801120000_organizations_foundation.sql`
