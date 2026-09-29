# 16. Organizations Foundation Migration — Review

> **Sprint 1.5 (Hardening Revision)**. This document explains the
> reasoning behind
> `supabase/migrations/20260801120000_organizations_foundation.sql` so a
> reviewer doesn't have to reverse-engineer intent from SQL comments alone.
> **The migration has not been run anywhere.** Only Founder may execute
> SQL against Supabase Production — see
> [`07_DEPLOYMENT.md`](./07_DEPLOYMENT.md) and
> [`BACKLOG_PHASE2.md`](./BACKLOG_PHASE2.md).

## Revision history

- **Sprint 1.5 (original)**: 8-table migration, `organizations_not_self_parent`
  CHECK only (no deeper cycle detection), flat `organization_id =
  current_organization_id()` on every policy (no hierarchy-aware read
  access), no explicit table-level GRANT/REVOKE (relied on Supabase
  project defaults), no acceptance test file.
- **Sprint 1.5 (Hardening Revision, this version)** — Founder review
  "Sprint 1.5 hardening": added the `organizations_prevent_cycle` trigger
  (blocks cycles of any depth, not just immediate self-parent), added
  `visible_organization_ids()` for hierarchical READ visibility (HQ admin
  sees descendant organizations), added explicit Section 6 table-level
  GRANT/REVOKE hardening, added
  [`18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`](./18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md),
  added
  [`../supabase/tests/organizations_foundation_acceptance.sql`](../supabase/tests/organizations_foundation_acceptance.sql)
  (60 read-only assertions). This revision **replaced the file in place**
  rather than layering a second migration on top, because the original was
  never applied anywhere — see "Why edit in place" below.

### Why edit in place, not a second migration

Supabase migrations are normally append-only once applied — you would
never edit a migration that has already run against any real database.
This one is different: it has never been applied to *any* database (not
even local/staging), so there is nothing yet whose history would be
disturbed by editing it. Once this migration is actually applied for the
first time (even to a local dev database), any *future* change must be a
new migration file, not another edit to this one.

## Scope of this migration

8 tables only, matching the Sprint 1.5 brief — **not** the full 46-table
design in [`12_SUPABASE_SCHEMA.md`](./12_SUPABASE_SCHEMA.md):

`organizations`, `users`, `roles`, `permissions`, `user_roles`,
`role_permissions`, `settings`, `audit_logs`.

Every other table (customers, animals, products, treatments, AI tables...)
is intentionally out of scope for this migration and will come in later
Sprints per [`BACKLOG_PHASE2.md`](./BACKLOG_PHASE2.md).

## Why this ordering matters

Every business table designed in `12_SUPABASE_SCHEMA.md` has
`organization_id not null`. That means `organizations` **must** exist and
have at least one row before any table that references it can be
populated. This migration is deliberately the first one written — no
table in it, except `organizations` itself, can be created without it.

## Key design decisions and why

### 1. No Postgres native `ENUM` types — `CHECK` constraints instead

`status`, `scope`, `action` etc. use `text ... check (... in (...))`
rather than `CREATE TYPE ... AS ENUM`. This matches the existing
`leads` table style from Phase 1
(`supabase/migrations/0001_init.sql`) and is easier to extend later
(`ALTER TABLE ... DROP CONSTRAINT` + re-add vs. `ALTER TYPE ... ADD VALUE`,
which has transaction restrictions in Postgres).

### 2. No extensions enabled

`gen_random_uuid()` has been core PostgreSQL functionality since v13; the
Supabase project already runs a version well past that. Enabling
`pgcrypto`/`uuid-ossp` would be an unused dependency — skipped per the
project's "minimal dependencies" principle (already applied to
`package.json` throughout Phase 1/1.5).

### 3. `roles`/`permissions` have no `organization_id`

Per `docs/11_DATABASE_ARCHITECTURE.md`, these are shared reference data —
every organization uses the same role vocabulary (`admin`, `doctor`...).
An organization doesn't invent its own roles; it assigns existing roles to
its users via `user_roles`.

### 4. `settings` uses `organization_id` directly for the `organization` scope, not a generic `scope_id`

The Sprint 1 (original) design used a generic `scope_id` for every scope
value including `organization`. Sprint 1 Revision changed this so
`organization`-scoped settings use the same `organization_id` column
every other table uses — one less special case for anyone querying
"everything belonging to organization X" across tables. `scope_id` is now
reserved for `scope = 'user'` only.

Because uniqueness rules differ per scope (global keys must be unique
platform-wide; organization keys unique per organization; user keys
unique per user), a single composite `UNIQUE` constraint across nullable
columns would not behave correctly — **NULL is never equal to NULL** in
uniqueness comparisons, so multiple `global` rows with the same `key`
would NOT be rejected by a naive composite unique constraint. The
migration uses **three partial unique indexes** instead (one per scope),
which is the correct way to express "uniqueness within a subset of rows"
in PostgreSQL.

### 5. `audit_logs` intentionally breaks the standard 5-column convention

Every other table in the project follows the "5 standard columns" rule
(`id`, `organization_id`, `created_at`, `updated_at`, `deleted_at` — see
`12_SUPABASE_SCHEMA.md`). `audit_logs` has **no `updated_at`, no
`deleted_at`** — an immutable ledger cannot logically be "updated" or
"soft-deleted" without defeating its own purpose. This is a deliberate,
documented exception, not an oversight.

### 6. Append-only enforcement has two independent layers

1. **RLS**: no `INSERT`/`UPDATE`/`DELETE` policy is granted to
   `authenticated`/`anon` at all. Only `service_role` (which bypasses RLS
   entirely in Supabase by design) can write.
2. **Trigger guard** (`prevent_audit_logs_mutation`): unconditionally
   raises an exception on `UPDATE`/`DELETE`, regardless of which
   Postgres role issues the statement. This protects against the edge
   case where a future migration accidentally grants a broader policy, or
   someone runs a manual `UPDATE` as a superuser role that bypasses RLS by
   default (table owners are not restricted by RLS unless `FORCE ROW
   LEVEL SECURITY` is set — the trigger closes this gap without needing
   `FORCE ROW LEVEL SECURITY`, which can have other side effects on
   trusted internal jobs).

**Residual risk**: a Postgres superuser could still run
`ALTER TABLE audit_logs DISABLE TRIGGER audit_logs_prevent_update;`
before mutating a row. This is accepted as an intentional, auditable DBA
action rather than something preventable purely at the schema level — it
requires deliberate superuser access, which only Founder/a trusted DBA
should have on Supabase Production.

### 7. RLS helper functions are `SECURITY DEFINER` with a fixed `search_path`

`current_organization_id()`, `is_super_admin()`, `has_role()`,
`has_permission()`, `current_app_user_id()` all run as
`SECURITY DEFINER`. This is required, not just a convenience:

- **Avoids RLS recursion**: a policy on `users` that needs to check
  "does this row's `organization_id` match mine?" would, without
  `SECURITY DEFINER`, need to query `users` again **under the RLS
  policy currently being evaluated** — a circular dependency. Supabase's
  documented pattern for this exact problem is a `SECURITY DEFINER`
  helper function, which runs with the function owner's privileges and
  is not itself subject to the calling policy.
- **`set search_path = public`** on every one of these functions is a
  deliberate hardening step: `SECURITY DEFINER` functions without a fixed
  `search_path` are a well-known Postgres privilege-escalation vector
  (an attacker-controlled `search_path` could redirect an unqualified
  table/function reference inside the function body to a malicious
  object). All table references inside these functions are also fully
  schema-qualified (`public.users`, not bare `users`) as a second layer of
  the same protection.
- `revoke all ... from public` + explicit `grant ... to authenticated, anon`
  makes the intended caller set explicit rather than relying on Postgres'
  default (execute granted to `PUBLIC` for new functions).

### 8. Privilege escalation prevention on `user_roles`

This is the most security-sensitive decision in the migration. Without a
specific guard, the `users_insert`-style logic ("an org admin manages
users in their own organization") would let a regular organization
`admin` insert a `user_roles` row assigning the **`super_admin`** role
code to themselves or anyone else in their organization — silently
escalating to platform-wide access.

The migration blocks this explicitly: `user_roles_insert` and
`user_roles_delete` both include
`and not exists (select 1 from roles r where r.id = user_roles.role_id and r.code = 'super_admin')`
in addition to the normal admin-of-same-organization check. Only a
request where `is_super_admin()` is already true can create or remove a
`super_admin` assignment. **This is the intended security boundary — do
not relax it when extending `user_roles` policies in a later migration.**

## The bootstrapping problem (read before first use)

Because of the guard above, **no one can grant the very first
`super_admin`** through the normal application flow — every path requires
either already being a super_admin, or is explicitly blocked from
assigning that specific role. This is expected, not a bug: it means the
first `super_admin` assignment must happen through a trusted, out-of-band
path, one of:

1. Founder runs a manual `INSERT INTO public.user_roles (...)` directly in
   the Supabase SQL Editor (Founder-only, per project policy), **after**
   creating the first `organizations` row and the first `users` row
   (linked to a real `auth.users` account created via Supabase Auth).
2. A one-time server-side bootstrap script using the `service_role` key
   (which bypasses RLS), run manually and deleted/rotated afterward — not
   left as a permanent code path in the application.

This sequence (`organizations` → `auth.users` signup → `public.users` row
→ manual `super_admin` `user_roles` row) should be written up as an
explicit runbook before Sprint 2 work begins — not included in this
review since it's an operational procedure, not a schema decision.

## Hierarchy & hierarchical visibility (added in the Hardening Revision)

### Cycle detection — now covers any depth, not just self-parent

`organizations_prevent_cycle` (Section 2B) walks the proposed
`parent_organization_id` chain upward on every INSERT/UPDATE and rejects
the write if the chain ever loops back to the row's own id — this blocks
A → B → C → A, not just the trivial A → A case the CHECK constraint
alone would catch. It is `SECURITY DEFINER` so it can see the whole
table regardless of the caller's own RLS-limited visibility, and has a
1000-hop safety valve against pathological/corrupt data (raises rather
than looping forever).

**Residual limitation**: the trigger only fires on `INSERT`/`UPDATE OF
parent_organization_id` — it correctly catches every way a cycle could be
introduced (since a cycle can only be created by changing a parent link),
so no further gap is currently known. If future migrations add other
ways to restructure the hierarchy (e.g. a bulk "re-parent all children of
X" operation), re-verify that operation still goes through a normal
`UPDATE` and thus still fires this trigger.

### Hierarchical visibility — implemented for READ only

`visible_organization_ids()` (Section 4) implements exactly the 4-tier
model requested:

| Role | Sees |
| --- | --- |
| `super_admin` | Every organization in the system |
| `admin` (non-super) | Their own organization **and every descendant** (children, grandchildren, ...) |
| Everyone else (doctor, employee, dealer_owner, customer, ai_system) | Their own organization only |

One rule — "self + descendants for admins, self-only otherwise" — applied
uniformly at whichever level an admin sits, correctly produces all of:
HQ admin sees HQ + all branches + all sub-units; a branch admin sees
their branch + its sub-units but NOT HQ or sibling branches; a leaf
("đơn vị trực thuộc") admin sees just itself (no descendants exist).
No separate "is this organization HQ" flag is needed.

**Deliberate scope boundary — read only, not write**: `visible_organization_ids()`
is used **only** in `SELECT` policies (`organizations_select`,
`users_select`, `user_roles_select`, `settings_select`'s organization
branch, `audit_logs_select`). Every `INSERT`/`UPDATE` policy in this
migration still compares against `current_organization_id()` (exact
match) — an HQ admin can *see* a branch's users/settings/audit trail, but
cannot create or edit them through this migration. This is a conservative
choice made explicitly to avoid opening a wider default permission than
requested; if Founder confirms hierarchical **write** access is actually
needed (e.g. HQ managing a branch's users directly), that is a
follow-up migration, not silently included here.

**Regression avoided during hardening**: the naive version of this change
would have been to replace every `organization_id = current_organization_id()`
read check with `organization_id in (select … from visible_organization_ids())`
uniformly. That would have been wrong for `audit_logs_select` specifically
— `visible_organization_ids()` returns "self only" even for non-admins, so
a blanket swap would have let *any* authenticated user (not just admins)
read their own organization's audit log, silently widening access beyond
`docs/13_RLS_POLICY_PLAN.md` ("chỉ admin đọc" audit_logs). The final
policy keeps an explicit `(is_super_admin() OR has_role('admin'))`
conjunct specifically to prevent this. A second, unrelated bug caught in
the same review pass: `audit_logs.organization_id` is nullable (for
auditing changes to global reference tables), and `x IN (subquery)` in
SQL can never match `NULL` — a naive policy would have made those rows
invisible to everyone, including super_admin. The final policy has a
dedicated `organization_id IS NULL AND is_super_admin()` branch for this.

## Known limitations (accepted for this Sprint, not fixed here)

- **Anonymous/public request → organization resolution** is unresolved.
  Once product/website tables gain `organization_id` in a later Sprint,
  an anonymous website visitor's request needs some way to know which
  organization's public catalog to show. Not needed for this migration
  (none of these 8 tables are publicly readable), but flagged here so it
  isn't forgotten — see `13_RLS_POLICY_PLAN.md` "Ghi chú triển khai".
- **`role_permissions` seed data is a starting point**, not a finished
  permission model. Only `admin`/`doctor`/`employee` get any seeded
  grants; `dealer_owner`/`customer`/`ai_system` get none because the
  tables their access would apply to don't exist yet in this migration.

## Rollback plan (documentation only — not embedded in the migration file)

> This section remains a **conditional plan to read and follow manually**
> — it is intentionally not a runnable script. Per the Sprint 1.5
> hardening instruction, no bulk `DROP` script exists anywhere in this
> repository for anyone to run casually; reverting this migration is a
> deliberate, reviewed action, not a one-command undo.

The migration file deliberately contains **no** `DROP TABLE`/down-migration
statements, per the Sprint 1.5 instruction to keep destructive rollback
logic out of the forward migration. If this migration is applied to a
real database and needs to be reverted, the reviewed procedure is:

1. **Before any real data exists** (i.e. right after applying to a fresh
   local/staging database for testing, and before running
   `18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`): drop the 8 tables and 9
   functions in **reverse dependency order** —
   `audit_logs`, `settings`, `role_permissions`, `user_roles`, `users`,
   `permissions`, `roles`, `organizations`, then the functions
   (`prevent_audit_logs_mutation`, `prevent_organization_cycle`,
   `set_updated_at`, `visible_organization_ids`, `has_permission`,
   `is_super_admin`, `has_role`, `current_organization_id`,
   `current_app_user_id`). This is safe only because no dependent data
   exists yet — confirm this by re-running
   `supabase/tests/organizations_foundation_acceptance.sql` check
   `zero_organizations_seeded_by_migration_itself`: if it still shows
   `PASS` (0 organizations), bootstrap has not happened yet and this
   simple path is safe to use.
2. **After real data exists** (any real organization/user/settings/audit
   rows): do **not** drop tables. Rolling back a foundation table that
   everything else references is a data-loss event, not a simple schema
   revert. Instead:
   - Take a full database backup/snapshot first (Supabase provides
     point-in-time recovery on paid tiers — confirm this is enabled
     before Sprint 2 work begins).
   - Prefer forward-fixing migrations (e.g. a corrective migration that
     adjusts a `CHECK` constraint) over reverting.
   - If a genuine revert is unavoidable, it must be planned as its own
     reviewed migration (following this same review process), not
     executed ad hoc.
3. **Functions and triggers** are safe to `CREATE OR REPLACE` repeatedly
   (already written idempotently in this migration) — reverting a
   function change is lower-risk than reverting a table.

## What reviewers should focus on

If short on time, review these six things first — they carry the most
risk if wrong:

1. The `user_roles` privilege-escalation guard (Section 8 above).
2. The `audit_logs` append-only enforcement (now 3 independent layers:
   RLS, table GRANT, trigger — Section 6 and "Hierarchical visibility"
   above).
3. That every policy filters by `organization_id` (or is one of the
   documented global-reference exceptions) — no policy should be able to
   return rows from a different organization.
4. The cycle-detection trigger (`organizations_prevent_cycle`) — confirm
   it is attached and fires on both INSERT and UPDATE OF
   parent_organization_id.
5. That `visible_organization_ids()` is used **only** where intended
   (SELECT policies) and that write policies still use the exact-match
   `current_organization_id()` — see "Hierarchical visibility" above for
   why this split matters.
6. The bootstrapping runbook
   ([`18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`](./18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md),
   needed before Sprint 2, not before this review).

Run [`../supabase/tests/organizations_foundation_acceptance.sql`](../supabase/tests/organizations_foundation_acceptance.sql)
against a local/staging project as a mechanical first pass before the
manual review above — it won't catch design intent issues, but it will
catch a missing index/trigger/policy immediately.

## File liên quan

- Migration file: [`../supabase/migrations/20260801120000_organizations_foundation.sql`](../supabase/migrations/20260801120000_organizations_foundation.sql)
- Acceptance checklist (manual): [`17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md`](./17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md)
- Acceptance assertions (automated, read-only): [`../supabase/tests/organizations_foundation_acceptance.sql`](../supabase/tests/organizations_foundation_acceptance.sql)
- Bootstrap runbook: [`18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md`](./18_SUPER_ADMIN_BOOTSTRAP_RUNBOOK.md)
- Full schema design: [`12_SUPABASE_SCHEMA.md`](./12_SUPABASE_SCHEMA.md)
- RLS strategy: [`13_RLS_POLICY_PLAN.md`](./13_RLS_POLICY_PLAN.md)
