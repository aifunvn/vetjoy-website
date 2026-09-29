# 20. Production Acceptance Plan — Organizations Foundation

> **Migration file is FROZEN as of Sprint 1.5 Hardening approval.**
> `supabase/migrations/20260801120000_organizations_foundation.sql` must
> not be edited as part of this plan. **Founder is the only person
> authorized to run SQL against Supabase Production** — this has been the
> project's standing rule since Phase 1 and applies without exception
> here. This document is a **process plan only**: writing it does not
> create, touch, or run anything against Production.
>
> **Entry condition**: this plan may only begin after
> [`19_STAGING_VALIDATION_PLAN.md`](./19_STAGING_VALIDATION_PLAN.md)
> Section 7's gate has been fully satisfied. If that gate has not been
> passed, stop and go there first.

## Purpose

Define exactly what must be true, in what order, before Founder runs
`20260801120000_organizations_foundation.sql` against the real Supabase
Production project — and what "accepted" means once it has run.

## 1. Quy trình xác nhận sẵn sàng Production

Unlike staging (which is created fresh for this purpose — see
`19_STAGING_VALIDATION_PLAN.md` Section 1), the Production project is a
long-lived asset Founder controls. Before applying anything to it,
confirm:

- [ ] The Production Supabase project already exists and its project ref
      is confirmed correct (double-check against the staging project ref
      — applying this migration to the wrong project is not a simple
      mistake to undo)
- [ ] **Point-in-Time Recovery (or an equivalent backup mechanism) is
      enabled on the Production project.** Unlike staging, this is **not
      optional** — see `16_ORGANIZATIONS_MIGRATION_REVIEW.md` "Rollback
      plan" step 2, which assumes this exists once real data is present.
      Confirm this in the Supabase dashboard's project settings and
      record the confirmation as evidence (Section 4).
- [ ] Access to the Production project is restricted to the minimum
      necessary people — confirm who currently has owner/admin access in
      the Supabase dashboard and that this matches Founder's expectation
- [ ] Production environment variables (if the website or any other
      service will eventually read `NEXT_PUBLIC_SUPABASE_URL` /
      `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` per
      `.env.example`) are not yet pointing anything live at this project
      in a way that could be affected mid-migration — at this stage
      nothing in `src/` reads from Supabase yet (Phase 1/1.5 run in demo
      mode), so this is a forward-looking check, not a current blocker
- [ ] The Production project is confirmed to have **no pre-existing
      tables named** `organizations`, `users`, `roles`, `permissions`,
      `user_roles`, `role_permissions`, `settings`, or `audit_logs` — the
      migration uses `create table if not exists`, which means a
      pre-existing table with a different, incompatible shape would be
      silently skipped rather than erroring, which could mask a serious
      problem. Confirm a clean slate explicitly rather than trusting
      `if not exists` to fail loudly.
- [ ] The exact migration file's SHA-256 hash matches the hash recorded
      in the Staging Evidence package
      (`19_STAGING_VALIDATION_PLAN.md` Section 4) — recompute it now:
      ```bash
      sha256sum supabase/migrations/20260801120000_organizations_foundation.sql
      ```
      A mismatch means something changed since staging validation and
      this plan must restart from `19_STAGING_VALIDATION_PLAN.md`, not
      continue.

## 2. Checklist chạy migration (Production)

- [ ] Founder is the one executing this (or is present and directly
      supervising if a trusted engineer runs the commands) — no
      assistant/agent runs this step under any circumstance
- [ ] Choose a low-traffic time window. There is no real user-facing
      impact yet (no existing Production tables depend on this — this is
      the *first* migration beyond Phase 1's `leads` table), but treating
      every Production write with this discipline from the start is the
      point
- [ ] Apply the migration exactly once, start to finish, in a single
      execution (matching how it was validated on staging in
      `19_STAGING_VALIDATION_PLAN.md` Section 2)
- [ ] Confirm it completes with **no errors**
- [ ] Immediately after, run a quick read-only sanity check (not the full
      60-assertion suite yet — that's Section 3) to confirm the 8 tables
      exist:
      ```sql
      select table_name from information_schema.tables
      where table_schema = 'public'
        and table_name in ('organizations','users','roles','permissions',
                            'user_roles','role_permissions','settings','audit_logs')
      order by table_name;
      -- expect exactly 8 rows
      ```
- [ ] Record the exact timestamp the migration was applied, and by whom

## 3. Checklist Acceptance (Production)

- [ ] Run [`../supabase/tests/organizations_foundation_acceptance.sql`](../supabase/tests/organizations_foundation_acceptance.sql)
      in full against Production. Confirm `total_checks = 60`,
      `passed_checks = 60`, `all_pass = true`.
- [ ] **Do not** repeat the full live-session cross-tenant/hierarchy
      testing from `17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md` sections 5,
      5B, 6, 7, 8 against Production using freshly-created fake
      organizations — that logic was already proven on staging with real
      test sessions, and creating throwaway test organizations directly
      in Production is unnecessary risk and clutter. Instead:
  - [ ] Confirm `select count(*) from public.organizations` returns `0`
        immediately after migration (nothing seeded automatically — by
        design, see `16_ORGANIZATIONS_MIGRATION_REVIEW.md` "Seed data")
  - [ ] Confirm `select code from public.roles order by code` returns
        exactly the 7 seeded role codes (`admin`, `ai_system`,
        `customer`, `dealer_owner`, `doctor`, `employee`, `super_admin`)
  - [ ] Treat the **real bootstrap** (Section 4 of this document, via
        `18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`) as the true first
        end-to-end proof on Production, rather than synthetic test data
        that would then need cleanup
- [ ] If any assertion fails here that passed on staging, **stop
      immediately** — this indicates a difference between the two
      environments (Postgres version, extension availability, a manual
      change made directly to Production outside this process) that must
      be understood before proceeding, not worked around

## 4. Evidence cần lưu

- [ ] Confirmation screenshot/log that Point-in-Time Recovery was already
      enabled **before** the migration ran (Section 1)
- [ ] The migration file's SHA-256 hash, confirmed matching staging
- [ ] Full raw output of both `organizations_foundation_acceptance.sql`
      result sets from Production, timestamped
- [ ] Exact date/time of the Production migration apply, and who ran it
- [ ] The Production project ref
- [ ] A copy of this document with every checkbox in Sections 1–3 marked
- [ ] If the real bootstrap (via
      `18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`) was performed as part of
      this acceptance pass, its own verification query results (that
      runbook's Step 5) — **without** recording the real email/UUID
      values themselves in any shared/committed document, per that
      runbook's own rule
- [ ] Store this evidence package in the same durable, non-repository
      location as the staging evidence (`19_STAGING_VALIDATION_PLAN.md`
      Section 4) — keep the two side by side for comparison

## 5. Rollback Plan (Production)

This inherits directly from
[`16_ORGANIZATIONS_MIGRATION_REVIEW.md`](./16_ORGANIZATIONS_MIGRATION_REVIEW.md#rollback-plan-documentation-only--not-embedded-in-the-migration-file)
— re-read it in full before this step, not after something goes wrong.
Production-specific emphasis:

- [ ] **Before bootstrap** (Section 4 of this document / the
      `18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md` steps have not yet been run
      for real): if a genuine defect is found during Section 3's
      acceptance pass, the "no dependent data yet" rollback path in
      `16_ORGANIZATIONS_MIGRATION_REVIEW.md` step 1 applies — dropping
      the 8 tables and 9 functions is acceptable, since PITR (Section 1)
      is the safety net if that turns out to be wrong.
- [ ] **After bootstrap** (a real organization/user/super_admin now
      exists): rollback moves to `16_ORGANIZATIONS_MIGRATION_REVIEW.md`
      step 2 — **no table drops**. Any issue found at this point is
      fixed forward (a new, separately-reviewed migration), never by
      reverting the foundation tables everything else will come to
      depend on.
- [ ] Confirm whoever holds Production access understands this
      before/after distinction — it is the single most important
      operational fact in this whole plan.

## 6. Founder Checklist (Production authorization)

Founder personally confirms every item below **before** Section 2 is
executed — this is the actual go/no-go moment:

- [ ] I have reviewed the full Staging Evidence package
      (`19_STAGING_VALIDATION_PLAN.md` Section 4) and it shows a clean
      pass
- [ ] I have confirmed Point-in-Time Recovery is enabled on the
      Production project myself (Section 1)
- [ ] I have recomputed the migration file's hash myself and confirmed it
      matches what was validated on staging
- [ ] I understand I am the one executing Section 2, or directly
      supervising the engineer who is
- [ ] I have read Section 5 (Rollback Plan) and specifically understand
      the before/after-bootstrap distinction
- [ ] I have decided who will perform the real super_admin bootstrap
      (`18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`) and when, relative to this
      migration run
- [ ] I authorize running
      `supabase/migrations/20260801120000_organizations_foundation.sql`
      against Production

## 7. Tiêu chí mới được phép chạy Production

All of the following must hold simultaneously — if any is false, do not
proceed to Section 2:

1. `19_STAGING_VALIDATION_PLAN.md` Section 7's gate passed in full.
2. This document's Section 1 readiness checks are all confirmed,
   **especially** Point-in-Time Recovery being enabled.
3. The migration file's SHA-256 hash is unchanged since staging
   validation (re-verified, not assumed).
4. Section 6's Founder Checklist is fully checked, by Founder personally.
5. No other, unrelated schema change is mid-flight on the Production
   project at the same time (this should be the only change happening).

Once the migration has been applied and Section 3's acceptance checklist
passes on Production with `all_pass = true`, this migration is considered
**accepted**. The next step is executing
[`18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`](./18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md)
for real, followed by Sprint 2 of
[`BACKLOG_PHASE2.md`](./BACKLOG_PHASE2.md) — both of which are separate,
future decisions, not part of this plan.

## File liên quan

- Migration file (frozen): [`../supabase/migrations/20260801120000_organizations_foundation.sql`](../supabase/migrations/20260801120000_organizations_foundation.sql)
- Staging plan (must pass first): [`19_STAGING_VALIDATION_PLAN.md`](./19_STAGING_VALIDATION_PLAN.md)
- Design rationale & rollback plan detail: [`16_ORGANIZATIONS_MIGRATION_REVIEW.md`](./16_ORGANIZATIONS_MIGRATION_REVIEW.md)
- Automated acceptance assertions: [`../supabase/tests/organizations_foundation_acceptance.sql`](../supabase/tests/organizations_foundation_acceptance.sql)
- Bootstrap runbook (after acceptance): [`18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`](./18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md)
- Next phase of work: [`BACKLOG_PHASE2.md`](./BACKLOG_PHASE2.md)
