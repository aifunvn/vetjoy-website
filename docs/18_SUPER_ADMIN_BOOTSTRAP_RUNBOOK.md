# 18. Super Admin Bootstrap Runbook

> **Founder-only.** Every SQL statement in this runbook that writes data is
> meant to be run **by Founder**, manually, in the Supabase SQL Editor (or
> by a trusted engineer Founder is directly supervising) — never by an
> assistant/agent, and never automatically. Nothing in this document
> contains a real email address, a real UUID, or a real credential —
> every value that must be real is written as an
> `<UPPERCASE_PLACEHOLDER>` for you to replace at the time you actually
> run it.
>
> This exists because of a deliberate design decision in
> `supabase/migrations/20260801120000_organizations_foundation.sql`: an
> organization `admin` can never grant the `super_admin` role to anyone
> (including themselves) — see
> [`16_ORGANIZATIONS_MIGRATION_REVIEW.md`](./16_ORGANIZATIONS_MIGRATION_REVIEW.md)
> "Privilege escalation prevention". That's correct and intentional, but
> it means the **very first** `super_admin` cannot be created through the
> app at all. This runbook is that one deliberate exception.

## 0. Preconditions — check all of these before running anything

- [ ] `supabase/migrations/20260801120000_organizations_foundation.sql`
      has been reviewed (see
      [`16_ORGANIZATIONS_MIGRATION_REVIEW.md`](./16_ORGANIZATIONS_MIGRATION_REVIEW.md))
      and applied to the target project (local, staging, or — only after
      staging sign-off — production).
- [ ] [`17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md`](./17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md)
      has passed on that same project.
- [ ] You are running this in the **Supabase SQL Editor** of the correct
      project (double-check the project name/URL in the browser tab —
      running this against the wrong project is not reversible in any
      simple way).
- [ ] You know the login email you personally intend to use as the
      platform's first super_admin. It does not need to be created yet —
      Step 2 creates it.
- [ ] You have decided the real name of the first organization (e.g. the
      legal or trading name of Công ty Thú y Chung Lương). Nothing here
      should be a placeholder or demo value — this becomes real
      production data.

## 1. Create the root organization

Run in the SQL Editor, replacing the placeholders:

```sql
insert into public.organizations (code, name, legal_name, contact_email, contact_phone, status)
values (
  '<ORG_CODE>',        -- short unique slug, e.g. 'vetjoy-hq' — lowercase, no spaces
  '<ORG_DISPLAY_NAME>', -- e.g. 'VETJOY'
  '<ORG_LEGAL_NAME>',   -- e.g. 'Công ty Thú y Chung Lương'
  '<ORG_CONTACT_EMAIL>',
  '<ORG_CONTACT_PHONE>',
  'active'
)
returning id;
```

**Copy the returned `id`** — you'll need it in Step 3. This is the
`organization_id` every subsequent user/branch will reference. Leave
`parent_organization_id` unset (null) — this is the root of the
hierarchy.

## 2. Create the Supabase Auth account (if it doesn't already exist)

Do this through the **Supabase Dashboard → Authentication → Users → Add
user** UI (or your normal invite flow), using the real email address you
decided on in the preconditions. Do **not** create this via raw SQL
`INSERT INTO auth.users` — Supabase manages that schema and expects auth
records to go through its own APIs so password hashing, email
confirmation, etc. are handled correctly.

Once created, find that user's `id` (a UUID) in the Dashboard's Users
list, or via SQL:

```sql
select id, email from auth.users where email = '<FOUNDER_LOGIN_EMAIL>';
```

**Copy this `id`** — this is the `auth_user_id` value for Step 3.

## 3. Create the `public.users` profile row

```sql
insert into public.users (organization_id, auth_user_id, full_name, status)
values (
  '<ORGANIZATION_ID_FROM_STEP_1>',
  '<AUTH_USER_ID_FROM_STEP_2>',
  '<FOUNDER_FULL_NAME>',
  'active'
)
returning id;
```

**Copy the returned `id`** — this is the `users.id` (distinct from
`auth_user_id`!) you need for Step 4.

## 4. Grant the first `super_admin` role

```sql
insert into public.user_roles (user_id, role_id)
select
  '<USERS_ID_FROM_STEP_3>',
  r.id
from public.roles r
where r.code = 'super_admin';
```

This is the one step that **must** be run this way (directly, as the
Postgres superuser session the SQL Editor gives you) — it is not
reachable through any RLS-protected application path by design, and that
is correct (see the box at the top of this document).

## 5. Verify

Run each of these and confirm the expected result before considering
bootstrap complete:

```sql
-- Expect exactly 1 row: your organization.
select id, code, name, status from public.organizations;

-- Expect exactly 1 row: your profile, status = 'active'.
select id, organization_id, full_name, status from public.users;

-- Expect exactly 1 row showing role code = 'super_admin' for your user.
select u.full_name, r.code
from public.user_roles ur
join public.users u on u.id = ur.user_id
join public.roles r on r.id = ur.role_id
where u.id = '<USERS_ID_FROM_STEP_3>';
```

Then, **logged in as that account** through the actual application (once
it exists) or via a short-lived test query using that session's JWT,
confirm:

```sql
select public.is_super_admin();        -- expect: true
select public.current_organization_id(); -- expect: your organization's id
select count(*) from public.organizations; -- expect: sees all organizations, not just one
```

If any of these return an unexpected value, **stop** — do not proceed to
create additional organizations, branches, or invite other users until
this is resolved.

## 6. Creating branches later (optional, not part of first bootstrap)

Once the root organization and its first super_admin exist, additional
organizations (branches / "chi nhánh" / "đơn vị trực thuộc") are created
the same way as Step 1, but with `parent_organization_id` set:

```sql
insert into public.organizations (code, name, parent_organization_id, status)
values ('<BRANCH_CODE>', '<BRANCH_NAME>', '<PARENT_ORGANIZATION_ID>', 'active')
returning id;
```

The cycle-detection trigger (`organizations_prevent_cycle`, see
`16_ORGANIZATIONS_MIGRATION_REVIEW.md`) will reject this automatically if
`<PARENT_ORGANIZATION_ID>` would create a loop — you do not need to check
that yourself. An `admin` role user (not just super_admin) can then be
created for that branch the same way as Steps 2–4 above, but assigning
the `admin` role instead of `super_admin`, and using the branch's
`organization_id` in Step 3. A branch admin created this way will, per
`visible_organization_ids()`, see their own branch and any of ITS
descendants, but not the parent or sibling branches — see
`11_DATABASE_ARCHITECTURE.md` for the hierarchy visibility model.

## Rollback — safe conditions only

- **Before Step 5 verification passes**: if something looks wrong, it is
  safe to `delete` the rows you just inserted, in reverse order (
  `user_roles` row, then `users` row, then `organizations` row), since at
  this point nothing else references them yet. Do **not** delete the
  `auth.users` row from Step 2 unless you are also abandoning that login
  entirely — prefer just removing the `public.users`/`user_roles` rows
  and re-running Steps 3–4 with corrected values.
- **After Step 5 verification passes and the account has been used**: do
  not delete anything. If the wrong person was granted `super_admin`,
  correct it forward — insert the correct grant for the right person,
  and separately remove the incorrect `user_roles` row for the wrong one
  (both are simple, targeted `delete`/`insert` statements, not a
  structural rollback). Never delete an `organizations` row once any
  `users`/business data references it — this is a foundation table (see
  `16_ORGANIZATIONS_MIGRATION_REVIEW.md` "Rollback plan").
- If in doubt, stop and take a database snapshot before proceeding
  further — Supabase point-in-time recovery (if enabled on the project's
  plan) is the safety net for anything beyond the simple pre-verification
  case above.

## What must NOT be done

- Do not add any code path in the frontend/website (`src/`) that performs
  any part of this bootstrap automatically — no "first user becomes
  admin" logic, no setup wizard that grants `super_admin`. This must stay
  a manual, Founder-executed, out-of-band procedure.
- Do not run any step of this runbook against Production without having
  already run it successfully against a local/staging project first.
- Do not reuse this document as a template with real values filled in and
  saved back into the repository — keep real emails/UUIDs/org names out
  of version control; this file must always read exactly like this
  (placeholders only).

## File liên quan

- Migration: [`../supabase/migrations/20260801120000_organizations_foundation.sql`](../supabase/migrations/20260801120000_organizations_foundation.sql)
- Design rationale (privilege escalation guard, hierarchy): [`16_ORGANIZATIONS_MIGRATION_REVIEW.md`](./16_ORGANIZATIONS_MIGRATION_REVIEW.md)
- Acceptance checklist: [`17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md`](./17_ORGANIZATIONS_ACCEPTANCE_CHECKLIST.md)
- Hierarchy/visibility model: [`11_DATABASE_ARCHITECTURE.md`](./11_DATABASE_ARCHITECTURE.md)
