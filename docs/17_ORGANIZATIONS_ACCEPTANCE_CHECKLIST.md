# 17. Organizations Foundation Migration — Acceptance Checklist

> Run this checklist against a **local or staging** Supabase project only.
> Nothing here should be run against Production — only Founder runs SQL
> against Production, and only after this checklist passes on staging
> first. Pairs with
> [`16_ORGANIZATIONS_MIGRATION_REVIEW.md`](./16_ORGANIZATIONS_MIGRATION_REVIEW.md)
> (read that for *why*; this file is *what to verify*).
>
> **Sprint 1.5 Hardening Revision**: sections 2 (cycle guard) and 3 (HQ/
> branch hierarchical visibility) below are new. Section 0 now also points
> at the automated companion script — run that first as a fast mechanical
> pass, then work through the manual sections below (some of which need a
> live session/JWT to test properly and can't be fully automated in
> read-only SQL).
>
> **Recommended order**: run
> [`../supabase/tests/organizations_foundation_acceptance.sql`](../supabase/tests/organizations_foundation_acceptance.sql)
> first (covers sections 1–4, 6–10 below mechanically), then do sections
> 5 and 6's live-session testing by hand, then work through
> [`18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`](./18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md).

Verification queries below are **read-only** (`select`) — safe to run
repeatedly. Where a check requires attempting a write to confirm it's
correctly *rejected*, that's noted explicitly so it isn't mistaken for a
routine query.

## 0. Pre-flight

- [ ] Applied to a **local or staging** Supabase project, not Production
- [ ] `supabase/migrations/20260801120000_organizations_foundation.sql`
      applied without error (`supabase db reset` or equivalent)
- [ ] Point-in-time recovery / backup confirmed enabled on the target
      project **before** any real data is entered (relevant once this
      moves toward Production — see `16_ORGANIZATIONS_MIGRATION_REVIEW.md`
      "Rollback plan")

## 1. Schema checks

- [ ] All 8 tables exist: `organizations`, `users`, `roles`, `permissions`,
      `user_roles`, `role_permissions`, `settings`, `audit_logs`
  ```sql
  select table_name from information_schema.tables
  where table_schema = 'public'
    and table_name in ('organizations','users','roles','permissions',
                        'user_roles','role_permissions','settings','audit_logs')
  order by table_name;
  -- expect exactly 8 rows
  ```
- [ ] `audit_logs` has **no** `updated_at`/`deleted_at` column (intentional
      exception — see review doc #5)
  ```sql
  select column_name from information_schema.columns
  where table_schema = 'public' and table_name = 'audit_logs';
  -- expect: id, organization_id, table_name, record_id, action,
  --         changed_by, old_values, new_values, created_at (9 columns, no more)
  ```
- [ ] `roles`/`permissions` have **no** `organization_id` column (global
      reference data — see review doc #3)
  ```sql
  select table_name, column_name from information_schema.columns
  where table_schema = 'public' and table_name in ('roles','permissions')
    and column_name = 'organization_id';
  -- expect: 0 rows
  ```
- [ ] Every other table (`organizations` excepted — it doesn't reference
      itself as tenant) has `organization_id`
  ```sql
  select table_name from information_schema.columns
  where table_schema = 'public'
    and table_name in ('users','settings','audit_logs')
    and column_name = 'organization_id';
  -- expect exactly 3 rows
  ```

## 2. Foreign key checks

- [ ] `users.organization_id → organizations.id`
- [ ] `users.auth_user_id → auth.users.id` (`on delete cascade`)
- [ ] `organizations.parent_organization_id → organizations.id` (self)
- [ ] `user_roles.user_id → users.id`, `user_roles.role_id → roles.id`
- [ ] `role_permissions.role_id → roles.id`, `role_permissions.permission_id → permissions.id`
- [ ] `settings.organization_id → organizations.id`,
      `settings.scope_id → users.id`, `settings.updated_by → users.id`
- [ ] `audit_logs.organization_id → organizations.id`,
      `audit_logs.changed_by → users.id`
  ```sql
  select
    tc.table_name, kcu.column_name, ccu.table_name as references_table, ccu.column_name as references_column
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu on tc.constraint_name = kcu.constraint_name
  join information_schema.constraint_column_usage ccu on tc.constraint_name = ccu.constraint_name
  where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public'
  order by tc.table_name;
  -- manually compare against the list above
  ```
- [ ] `organizations_not_self_parent` CHECK exists and rejects
      `parent_organization_id = id` (attempt an insert that violates it —
      expect a constraint violation error, then do not commit that test row)
- [ ] `settings_scope_shape_check` CHECK exists and rejects inconsistent
      scope/organization_id/scope_id combinations (e.g. `scope='global'`
      with a non-null `organization_id` — expect rejection)

## 2B. Organization hierarchy cycle checks (new — Hardening Revision)

- [ ] Immediate self-parent is rejected (covered by the CHECK constraint
      in section 2 above)
- [ ] A **3-hop cycle** is rejected: create org A, then org B with
      `parent_organization_id = A`, then org C with
      `parent_organization_id = B`, then attempt
      `update organizations set parent_organization_id = C where id = A`
      (this would close the loop A → B → C → A) — expect this exact
      error: `organization hierarchy cycle detected: organization <A's id>
      cannot be its own ancestor (via parent chain starting at <C's id>)`
      — not a generic constraint violation, confirming the trigger (not
      just the CHECK) is what caught it
- [ ] A **legitimate deep chain** (HQ → chi nhánh → đơn vị trực thuộc,
      3+ levels) is accepted without error — confirms the guard blocks
      cycles specifically, not depth in general
- [ ] Confirm the trigger fires on both `INSERT` and `UPDATE OF
      parent_organization_id`:
  ```sql
  select tgname, tgtype from pg_trigger t
  join pg_class c on c.oid = t.tgrelid
  where c.relname = 'organizations' and tgname = 'organizations_prevent_cycle';
  -- expect exactly 1 row
  ```

## 3. Unique constraint checks

- [ ] `organizations.code` unique
- [ ] `roles.code` unique
- [ ] `permissions.code` unique
- [ ] `users.auth_user_id` unique
- [ ] `user_roles` PK `(user_id, role_id)` — inserting the same pair twice
      is rejected
- [ ] `role_permissions` PK `(role_id, permission_id)` — same check
- [ ] `settings` partial unique indexes behave correctly per scope:
  - [ ] Two rows with `scope='global'` and the same `key` → **rejected**
  - [ ] Two rows with `scope='organization'`, same `organization_id` +
        `key` → **rejected**; same `key` but **different**
        `organization_id` → **allowed**
  - [ ] Two rows with `scope='user'`, same `scope_id` + `key` →
        **rejected**; same `key` but different `scope_id` → **allowed**

## 4. RLS checks (general)

- [ ] `select relname, relrowsecurity from pg_class where relnamespace = 'public'::regnamespace and relname in (...)` shows `relrowsecurity = true` for all 8 tables
- [ ] No policy in any of the 8 tables uses a bare `using (true)` or
      `with check (true)`
  ```sql
  select schemaname, tablename, policyname, qual, with_check
  from pg_policies
  where schemaname = 'public'
    and (qual = 'true' or with_check = 'true');
  -- expect: 0 rows
  ```
- [ ] Helper functions (`current_organization_id`, `is_super_admin`,
      `has_role`, `has_permission`, `current_app_user_id`,
      `visible_organization_ids` — 6 total as of the Hardening Revision)
      are `SECURITY DEFINER` with `search_path` fixed to `public`
  ```sql
  select proname, prosecdef, proconfig
  from pg_proc
  where pronamespace = 'public'::regnamespace
    and proname in ('current_organization_id','is_super_admin','has_role',
                     'has_permission','current_app_user_id','visible_organization_ids');
  -- expect prosecdef = true and proconfig containing 'search_path=public' for all 6
  ```
- [ ] Trigger functions (`set_updated_at`, `prevent_audit_logs_mutation`)
      are **NOT** `SECURITY DEFINER` (they don't need to read across
      tables outside RLS, unlike `prevent_organization_cycle` which
      **is** `SECURITY DEFINER` on purpose — see review doc "Hierarchical
      visibility")
- [ ] Table-level GRANT/REVOKE hardening (Section 6 of the migration) is
      present: `anon` has zero privileges on all 8 tables, `authenticated`
      has no `INSERT`/`UPDATE`/`DELETE` grant on `audit_logs`
  ```sql
  select grantee, table_name, privilege_type
  from information_schema.role_table_grants
  where table_schema = 'public' and grantee in ('anon', 'PUBLIC')
    and table_name in ('organizations','users','roles','permissions',
                        'user_roles','role_permissions','settings','audit_logs');
  -- expect: 0 rows
  ```

## 5. Cross-tenant denial checks (most important — test with real sessions)

Create 2 test organizations (Org A, Org B) with one test user each (via
Supabase Auth signup + a corresponding `public.users` row), then, acting
**as the Org A user's JWT** (not service_role):

- [ ] `select * from organizations` returns **only** Org A's row, never
      Org B's
- [ ] `select * from users` returns **only** Org A's users
- [ ] `select * from settings where scope = 'organization'` returns
      **only** Org A's organization-scoped settings
- [ ] `select * from audit_logs` (as an Org A admin) returns **only** Org
      A's audit entries
- [ ] Attempting `update organizations set name = '...' where id = '<Org B's id>'`
      affects **0 rows** (not an error — RLS silently excludes the row,
      which is expected `UPDATE ... WHERE` behavior under RLS)
- [ ] Attempting `insert into users (organization_id, ...) values ('<Org B's id>', ...)`
      as an Org A admin is **rejected** by `users_insert`'s `with check`

## 5B. Hierarchical visibility checks — HQ / branch / sibling (new — Hardening Revision)

Build a 3-level hierarchy: HQ (org, no parent), Branch-1 and Branch-2
(both `parent_organization_id = HQ`), Sub-unit-1 (`parent_organization_id
= Branch-1`). Create one `admin`-role user in each of HQ, Branch-1,
Branch-2, Sub-unit-1, plus one non-admin (e.g. `employee`) user in
Branch-1.

- [ ] **HQ admin** querying `select id from organizations` sees HQ,
      Branch-1, Branch-2, **and** Sub-unit-1 (all 4)
- [ ] **Branch-1 admin** sees Branch-1 and Sub-unit-1 only — **not** HQ
      and **not** Branch-2 (sibling exclusion is the critical case here)
- [ ] **Branch-2 admin** sees Branch-2 only (it has no descendants)
- [ ] **Sub-unit-1 admin** sees Sub-unit-1 only (leaf node, no descendants)
- [ ] **Branch-1's non-admin employee** sees Branch-1 only — **not**
      Sub-unit-1, even though Branch-1's own admin *can* see it (confirms
      the expansion is admin-role-gated, not automatic for every member)
- [ ] Repeat the HQ-admin/Branch-1-admin checks above against `users`,
      `settings` (`scope='organization'` rows), and `audit_logs` — same
      visibility pattern expected (self + descendants for admins, self
      only otherwise)
- [ ] **Write-path check (must NOT expand)**: as Branch-1's admin,
      attempt `update users set full_name = '...' where organization_id =
      '<Sub-unit-1's id>'` — expect **0 rows affected** (write policies
      intentionally still require an exact `current_organization_id()`
      match, even though the same admin can *read* Sub-unit-1's users).
      This is the conservative "read expands, write doesn't" boundary —
      see review doc "Hierarchical visibility" for why.

## 6. `super_admin` checks

- [ ] A regular `admin` (not super_admin) attempting to insert a
      `user_roles` row assigning the `super_admin` role code (to
      themselves or anyone) is **rejected** — this is the privilege
      escalation guard (see review doc #8). Confirm the `not exists (...
      r.code = 'super_admin')` clause is actually what blocks it, not an
      unrelated failure.
- [ ] A regular `admin` attempting to `delete` an existing `super_admin`
      `user_roles` row is **also rejected** by the same guard
- [ ] A user holding `super_admin` **can** read/write across
      organizations (spot check: `select * from organizations` as
      super_admin returns rows from **both** Org A and Org B)
- [ ] Confirm the bootstrapping runbook (see
      `16_ORGANIZATIONS_MIGRATION_REVIEW.md` "The bootstrapping problem")
      is documented and understood by whoever will create the *first*
      `super_admin` — this cannot be done through normal app-level RLS-
      protected flows by design

## 7. `audit_logs` append-only checks

- [ ] As `authenticated` (any role, including `admin`/`super_admin`),
      `insert into audit_logs (...) values (...)` is rejected — **no**
      insert policy exists for client roles at all (only `service_role`
      can write, and it bypasses RLS)
- [ ] As `authenticated`, `update audit_logs set action = 'update' where id = '<any existing row>'`
      is rejected **at the trigger level** (expect the exact error
      `audit_logs is append-only: UPDATE is not permitted on this table`,
      not a generic RLS denial — confirms the trigger guard fires, not
      just RLS)
- [ ] Same for `delete from audit_logs where id = '<any existing row>'` —
      expect `audit_logs is append-only: DELETE is not permitted on this table`
- [ ] Confirm this trigger-level rejection happens even when connected as
      the table owner/superuser role (not just as `authenticated`) — this
      is the "defense in depth beyond RLS" property from review doc #6

## 8. `settings` isolation checks

- [ ] A `scope='global'` row (organization_id null) is readable by any
      authenticated user, from any organization
- [ ] A `scope='organization'` row for Org A is **not** readable by an Org
      B user (non-admin or admin)
- [ ] A `scope='user'` row for User X is **not** readable by User Y, even
      within the same organization
- [ ] An Org A `admin` can `insert`/`update` `scope='organization'` rows
      with `organization_id` = Org A's id, but **cannot** target Org B's
      `organization_id`
- [ ] No `delete` policy exists for `settings` — confirm a `delete`
      attempt (any role except direct service_role/superuser bypass) is
      rejected; soft-delete via `update ... set deleted_at = now()` is the
      only supported removal path

## 9. No-secret checks

- [ ] `grep`-style search of the migration file for hardcoded credentials,
      API keys, tokens, or real contact information — expect **zero**
      matches (the file should contain only schema, policy logic, and the
      minimal role/permission seed data listed in
      `16_ORGANIZATIONS_MIGRATION_REVIEW.md`)
- [ ] No `organizations` row is seeded by the migration itself (deliberate
      — see review doc "Seed data") — confirm `select count(*) from organizations`
      is `0` immediately after applying the migration to a fresh database
- [ ] Confirm no `.env`/service-role key value appears anywhere in
      `supabase/migrations/20260801120000_organizations_foundation.sql`
      or in either review/checklist doc

## 10. Rollback plan

- [ ] Confirm the migration file contains **no** `DROP TABLE` / down-
      migration statements (rollback intentionally lives only in
      `16_ORGANIZATIONS_MIGRATION_REVIEW.md` "Rollback plan", not in SQL)
- [ ] Confirm whoever applies this migration to staging/production has
      read the rollback plan **before** applying, not after something
      goes wrong
- [ ] Confirm a database backup/snapshot exists before applying to any
      environment that already holds real (non-test) data

## Sign-off

- [ ] All sections above checked on a local/staging Supabase project
- [ ] Reviewed by: _______________ (name/date)
- [ ] Approved for Founder to apply to Production: ☐ Yes ☐ Not yet — open items: _______________

## File liên quan

- Migration file: [`../supabase/migrations/20260801120000_organizations_foundation.sql`](../supabase/migrations/20260801120000_organizations_foundation.sql)
- Automated read-only assertions (run first): [`../supabase/tests/organizations_foundation_acceptance.sql`](../supabase/tests/organizations_foundation_acceptance.sql)
- Design rationale: [`16_ORGANIZATIONS_MIGRATION_REVIEW.md`](./16_ORGANIZATIONS_MIGRATION_REVIEW.md)
- Bootstrap runbook (run after this checklist passes): [`18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`](./18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md)
- RLS strategy: [`13_RLS_POLICY_PLAN.md`](./13_RLS_POLICY_PLAN.md)
