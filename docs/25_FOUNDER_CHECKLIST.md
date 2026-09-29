# 25. Founder Checklist (reusable template)

> This is a **reusable template**, not a one-time record. Copy this
> file's checklist body into each future migration's own folder
> (`docs/migrations/<name>/FOUNDER_CHECKLIST.md`, per
> `23_MIGRATION_POLICY.md` Section 3) and fill it in for that specific
> migration — do not check boxes directly in *this* file, since this copy
> has to stay blank for the next migration to reuse. The filled-in
> instance for Sprint 1.5 already exists as Section 6 of
> `19_STAGING_VALIDATION_PLAN.md` and `20_PRODUCTION_ACCEPTANCE_PLAN.md`
> — this document generalizes that pattern for every migration after it.

## How to use this template

1. Copy the relevant stage's checklist below into the migration-specific
   copy.
2. Fill in `<MIGRATION_NAME>` and `<MIGRATION_FILE>` at the top.
3. Founder checks each box **personally** — this is not delegable to an
   assistant/agent or a reviewing engineer, per
   [`21_GOVERNANCE.md`](./21_GOVERNANCE.md) Roles table.
4. An unchecked box blocks progression to the next pipeline stage. There
   is no "check it anyway, we'll fix it later" — see
   `21_GOVERNANCE.md` Rule 2 ("No stage may be skipped").

---

## Migration: `<MIGRATION_NAME>`

File: `supabase/migrations/<MIGRATION_FILE>`
SHA-256 (recorded at Staging): `<HASH>`

### A. Architecture sign-off

- [ ] I have read the Architecture notes for this migration and they
      correctly scope what this Sprint covers (`22_DEVELOPMENT_WORKFLOW.md`
      Stage 1)
- [ ] Any change to the shared reference schema
      (`12_SUPABASE_SCHEMA.md`) this migration implies has been reflected
      there, not left only in this migration's own notes

### B. Review sign-off

- [ ] I have read the Review Doc for this migration in full
- [ ] Every non-obvious design decision has a stated rationale I
      understand and agree with
- [ ] The Rollback Plan section is present and I have read it

### C. Hardening sign-off

- [ ] I have read what was checked during Hardening (privilege
      escalation, RLS recursion, `search_path`, grant scope, cross-tenant
      leakage) and what — if anything — was found and fixed
- [ ] No `USING (true)` / `WITH CHECK (true)` exists anywhere in this
      migration

### D. Acceptance sign-off

- [ ] The Acceptance Checklist for this migration exists and is complete
- [ ] The Acceptance SQL for this migration exists, is read-only (no
      INSERT/UPDATE/DELETE), and reports PASS/FAIL + a
      total/passed/all-pass summary

### E. Staging sign-off

- [ ] Staging Evidence package reviewed in full — not just the
      `all_pass = true` summary line
- [ ] Migration applied cleanly to Staging, including a re-apply
      idempotency check
- [ ] All manual (live-session) Acceptance Checklist items passed on
      Staging
- [ ] Any bootstrap/runbook this migration requires was rehearsed on
      Staging end-to-end

### F. Evidence sign-off

- [ ] SHA-256 hash recorded at Staging matches what I am about to
      authorize for Production (recompute it myself, don't trust a
      prior report of it)
- [ ] Evidence package is stored somewhere durable and reviewable (not
      only in chat/session scrollback)
- [ ] Point-in-Time Recovery (or equivalent backup) is confirmed enabled
      on the Production project

### G. Production authorization (the actual go/no-go)

- [ ] I have completed sections A–F above for this specific migration
- [ ] I am the one executing the Production run, or directly supervising
      whoever is
- [ ] I understand this migration's Rollback Plan's before/after-real-
      data distinction
- [ ] I authorize running `<MIGRATION_FILE>` against Production

**Decision**: ☐ Approved for Production ☐ Not yet — blocking items:
_______________________________________________

**Signed**: _______________________ **Date**: _______________

---

## File liên quan

- Governance rules: [`21_GOVERNANCE.md`](./21_GOVERNANCE.md)
- Workflow this checklist walks through: [`22_DEVELOPMENT_WORKFLOW.md`](./22_DEVELOPMENT_WORKFLOW.md)
- Artifact requirements: [`23_MIGRATION_POLICY.md`](./23_MIGRATION_POLICY.md)
- Filled-in Sprint 1.5 instance (reference example): [`19_STAGING_VALIDATION_PLAN.md`](./19_STAGING_VALIDATION_PLAN.md) §6, [`20_PRODUCTION_ACCEPTANCE_PLAN.md`](./20_PRODUCTION_ACCEPTANCE_PLAN.md) §6
