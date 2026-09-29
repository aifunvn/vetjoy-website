# 19. Staging Validation Plan — Organizations Foundation

> **Migration file is FROZEN as of Sprint 1.5 Hardening approval.**
> `supabase/migrations/20260801120000_organizations_foundation.sql` must
> not be edited as part of this plan or its execution. If staging
> validation surfaces a real defect, that is a new, separately-reviewed
> change — not a same-file edit. This document is a **process plan
> only**: no source code, no migration, no commit, no push, and no
> environment (staging or production) is created or touched by writing
> this document.

## Purpose

Prove — with evidence, not assumption — that
`20260801120000_organizations_foundation.sql` behaves exactly as
designed in [`16_ORGANIZATIONS_MIGRATION_REVIEW.md`](./16_ORGANIZATIONS_MIGRATION_REVIEW.md)
when applied to a real (but disposable) Supabase project, **before**
Founder considers running it against Production. Passing this plan is
the only path into [`20_PRODUCTION_ACCEPTANCE_PLAN.md`](./20_PRODUCTION_ACCEPTANCE_PLAN.md).

## 1. Quy trình tạo Supabase Staging

1. Founder (or an engineer Founder directly authorizes) creates a **new,
   separate Supabase project** dedicated to staging — never reuse a
   project that has ever held real customer data for this purpose, and
   never point staging at the same project intended for Production.
2. Name the project unambiguously, e.g. `vetjoy-staging`, so it cannot be
   confused with a future `vetjoy-production` project in the Supabase
   dashboard.
3. Choose a region matching whatever Production will eventually use — a
   mismatched region isn't a correctness risk for this migration, but
   keeping the environments comparable now avoids surprises later.
4. Record the staging project's Supabase project ref (visible in the
   dashboard URL / project settings) — this becomes part of the Evidence
   in Section 4.
5. Set up local access:
   - Install/confirm the Supabase CLI is available to whoever will run
     the migration.
   - `supabase link --project-ref <STAGING_PROJECT_REF>` (or the
     equivalent SQL Editor access if not using the CLI).
   - Store the staging project's connection details the same way
     `.env.example` already documents for future Supabase integration —
     **never** commit a real staging URL/key into the repository. A
     local, gitignored `.env.local` (or the Supabase CLI's own config) is
     the right place.
6. Confirm the staging project is **empty** (no tables beyond Supabase's
   own managed `auth`/`storage`/etc. schemas) before proceeding — this
   plan validates a migration running against a clean slate, matching
   how it will first run against Production.
7. If the staging Supabase plan tier supports Point-in-Time Recovery,
   enabling it here is optional (staging data is disposable) but doing so
   is a cheap rehearsal for confirming the same setting will be available
   and understood before Production (see
   [`20_PRODUCTION_ACCEPTANCE_PLAN.md`](./20_PRODUCTION_ACCEPTANCE_PLAN.md)
   Section 1, where enabling it is **not optional**).

## 2. Checklist chạy migration (Staging)

- [ ] Confirm the exact file being applied is
      `supabase/migrations/20260801120000_organizations_foundation.sql`
      from this repository, unmodified — record its checksum for the
      Evidence log:
      ```bash
      sha256sum supabase/migrations/20260801120000_organizations_foundation.sql
      ```
      (or `Get-FileHash` on Windows PowerShell). This hash is what
      Section 4 (Evidence) and, later,
      [`20_PRODUCTION_ACCEPTANCE_PLAN.md`](./20_PRODUCTION_ACCEPTANCE_PLAN.md)
      Section 1 compare against — Production must apply a file with this
      **exact same hash**, proving no drift happened between staging
      validation and production application.
- [ ] Apply the migration to staging (via `supabase db push`, or by
      pasting the full file into the Supabase SQL Editor and running it
      once, start to finish, in one execution).
- [ ] Confirm it completes with **no errors** — a failed migration
      partway through must be investigated (likely by resetting the
      staging database and re-applying cleanly) before proceeding; do not
      attempt to manually patch a partially-applied state by hand.
- [ ] Re-run the same migration a second time against the same staging
      database. Confirm it completes with **no errors** and produces no
      unintended duplicate objects. This is possible precisely because
      the migration is idempotent (`if not exists` / `create or replace` /
      `drop policy if exists` throughout — see
      `16_ORGANIZATIONS_MIGRATION_REVIEW.md`), and passing this specific
      check is itself evidence that property holds in practice, not just
      in code review.
- [ ] Record: date/time applied, who applied it, staging project ref,
      file hash from the first bullet above.

## 3. Checklist Acceptance (Staging)

- [ ] Run [`../supabase/tests/organizations_foundation_acceptance.sql`](../supabase/tests/organizations_foundation_acceptance.sql)
      in full against staging. Confirm the summary result shows
      `total_checks = 60`, `passed_checks = 60`, `all_pass = true`. Any
      `FAIL` row must be resolved (see the routing note below) before
      continuing.
- [ ] Work through every manual section of
      [`17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md`](./17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md)
      that requires a live session/JWT (sections 5, 5B, 6, 7, 8) — these
      cannot be fully automated in read-only SQL and need real test
      organizations/users created on staging.
- [ ] All test data created for this purpose (test organizations named
      clearly, e.g. `staging-test-org-a`, `staging-test-org-b`, and their
      test users) must be:
  - [ ] Obviously fake — no real customer names, emails, or phone numbers
  - [ ] Either cleaned up after acceptance testing completes, or clearly
        documented as "left in staging intentionally for future
        regression testing" (pick one and record which)
- [ ] Run [`18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`](./18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md)
      against staging end-to-end, using a **staging-only** test email —
      this is the first real rehearsal of that runbook and must be done
      here, not for the first time on Production. Confirm every
      verification query in the runbook's Step 5 returns the expected
      result.
- [ ] **Routing a FAIL**: if any automated assertion or manual checklist
      item fails, do not attempt an ad hoc fix on staging. Stop, document
      exactly which check failed and the observed vs. expected result,
      and route it back through the same review process that produced
      `16_ORGANIZATIONS_MIGRATION_REVIEW.md` — a real defect in a frozen
      migration file means a new reviewed revision, not a quick patch.

## 4. Evidence cần lưu

Store all of the following somewhere durable (not just left in a
terminal scrollback) — a shared drive folder, an internal wiki page, or
committed to a *separate* internal ops repository if one exists (not this
public-facing website repo):

- [ ] The migration file's SHA-256 hash (Section 2)
- [ ] Full raw output of both result sets from
      `organizations_foundation_acceptance.sql` (the per-assertion PASS/
      FAIL listing and the summary row), timestamped
- [ ] Screenshot or copied log output showing the migration applied
      successfully (from `supabase db push` output or the SQL Editor's
      success confirmation)
- [ ] The staging project ref/name used
- [ ] Who performed each step (name) and when (date)
- [ ] A copy of the completed
      [`17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md`](./17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md)
      sign-off section with boxes checked
- [ ] Confirmation of what happened to staging test data (cleaned up, or
      intentionally retained — per Section 3)
- [ ] Any deviation from this plan, and why (e.g. a check was skipped
      because it genuinely doesn't apply — document the reasoning rather
      than silently omitting it)

This evidence package is exactly what
[`20_PRODUCTION_ACCEPTANCE_PLAN.md`](./20_PRODUCTION_ACCEPTANCE_PLAN.md)
requires Founder to review before authorizing a production run — keep it
together, not scattered.

## 5. Rollback Plan (Staging)

Staging holds only synthetic test data, so rollback here is low-risk
compared to Production — but the exercise is still worth doing exactly
once, as a rehearsal:

- [ ] Confirm you can tear down the entire staging project (or drop all
      8 tables + 9 functions in the reverse order documented in
      `16_ORGANIZATIONS_MIGRATION_REVIEW.md` "Rollback plan") cleanly.
- [ ] If choosing to drop tables rather than the whole project, verify
      the drop order matches the reverse-dependency order in that same
      section, and confirm no leftover orphaned function/trigger remains
      afterward (`select proname from pg_proc where pronamespace =
      'public'::regnamespace` should no longer list any of the 9
      functions this migration created).
- [ ] Record whether staging was torn down, reset, or left running with
      its test data intact after validation — this affects whether the
      **next** staging validation run (e.g. after a future migration
      revision) starts from a clean slate or an already-populated one.

## 6. Founder Checklist (Staging sign-off)

Before this plan is considered complete, Founder personally confirms:

- [ ] I have reviewed the Evidence package (Section 4) in full, not just
      the summary "all_pass = true" line
- [ ] I understand the migration file is frozen — nothing was changed
      between what Sprint 1.5 Hardening approved and what was just tested
      on staging (hash match confirmed)
- [ ] I have read
      [`18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`](./18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md)
      in full and understand I am the one who will execute it for real
      afterward
- [ ] I have read `16_ORGANIZATIONS_MIGRATION_REVIEW.md` "Rollback plan"
      and understand its constraints once real data exists
- [ ] Any open decision items from
      [`BACKLOG_PHASE2.md`](./BACKLOG_PHASE2.md) Sprint 1 Revision (auth
      strategy, admin data source for `provinces`/`districts`/`communes`,
      Supabase billing tier) that are relevant to going live are either
      resolved or explicitly deferred with a documented reason
- [ ] I authorize proceeding to
      [`20_PRODUCTION_ACCEPTANCE_PLAN.md`](./20_PRODUCTION_ACCEPTANCE_PLAN.md)

## 7. Tiêu chí để được phép tiến sang lập kế hoạch Production

All of the following must be true — this is a hard gate, not a
guideline:

1. Section 2's migration checklist passed on staging, including the
   re-apply idempotency check.
2. Section 3's full acceptance checklist passed — automated (60/60) and
   manual — with zero unresolved `FAIL`s.
3. Section 4's Evidence package exists and is reviewable by Founder.
4. Section 5's rollback rehearsal was actually performed at least once.
5. Section 6's Founder Checklist is fully checked.
6. No change of any kind was made to the migration file during this
   entire process (re-verify the SHA-256 hash one final time immediately
   before moving to
   [`20_PRODUCTION_ACCEPTANCE_PLAN.md`](./20_PRODUCTION_ACCEPTANCE_PLAN.md)).

If all six hold, proceed to
[`20_PRODUCTION_ACCEPTANCE_PLAN.md`](./20_PRODUCTION_ACCEPTANCE_PLAN.md).
If any do not hold, stay on staging and resolve the gap first.

## File liên quan

- Migration file (frozen): [`../supabase/migrations/20260801120000_organizations_foundation.sql`](../supabase/migrations/20260801120000_organizations_foundation.sql)
- Design rationale: [`16_ORGANIZATIONS_MIGRATION_REVIEW.md`](./16_ORGANIZATIONS_MIGRATION_REVIEW.md)
- Manual acceptance checklist: [`17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md`](./17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md)
- Automated acceptance assertions: [`../supabase/tests/organizations_foundation_acceptance.sql`](../supabase/tests/organizations_foundation_acceptance.sql)
- Bootstrap runbook: [`18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`](./18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md)
- Next step: [`20_PRODUCTION_ACCEPTANCE_PLAN.md`](./20_PRODUCTION_ACCEPTANCE_PLAN.md)
