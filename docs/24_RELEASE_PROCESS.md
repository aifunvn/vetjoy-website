# 24. Release Process

> Implements [`21_GOVERNANCE.md`](./21_GOVERNANCE.md) Rule 6 (no commit
> without Founder approval) and ties together how website code changes
> and database migrations become an actual "release" of VETJOY.

## Current state (be honest about what exists today)

As of this document: there is one commit on `main`
(`e53215a76f1cf2a800defd0ccc73016354ebb124`, pushed to
`https://github.com/aifunvn/vetjoy-website`), no CI/CD pipeline
configured, no hosting platform chosen (`07_DEPLOYMENT.md`), and no
Supabase migration has ever been applied anywhere (`16`–`20` are all
still pre-Staging). This document describes the process that applies
**now**, with today's tooling, and flags clearly which parts are
forward-looking for once a platform/CI is chosen.

## The commit workflow (Rule 6, made concrete)

Every commit to this repository follows this exact sequence — this is
not new; it is the same sequence already used for the one commit that
exists today, now written down as standing policy:

1. `git status` — see exactly what's changed/untracked.
2. `git diff` (staged and unstaged) — review the actual content, not
   just filenames.
3. Secret scan — grep the diff for API keys, tokens, passwords,
   connection strings before staging anything (see the pattern used
   throughout Phase 1/1.5 and Sprint 1/1.5's own commit).
4. Run the relevant quality gate:
   - Website change: `npm run lint`, `npm test`, `npm run build` — all
     must pass.
   - Database change: the migration's own Acceptance SQL against
     whatever environment it was run against (never Production for an
     unapproved migration).
5. Present the exact file list, diff summary, and proposed commit message
   to Founder.
6. **Wait for explicit approval in that session.** A prior approval for a
   *different* commit, or a general "looks good" about the work in
   general, is not approval for *this specific* `git commit` invocation.
7. Only after explicit approval: stage the specific files (never blanket
   `git add -A`/`git add .` without reviewing what it picks up — see the
   `.gitignore`/`.env.example` interaction documented in
   `07_DEPLOYMENT.md`), commit, and report the resulting hash/branch/
   status back.
8. Push only follows the same explicit-approval requirement, separately
   — approval to commit is not approval to push, and approval to push to
   one branch is not approval to force-push or push to another.

This is exactly what happened for the existing commit
(`e53215a7...`) — Governance V1 makes it official policy rather than
one session's good practice.

## What "release" means right now (docs-and-code-only phase)

Until a hosting platform is chosen and Supabase migrations start being
applied for real, a "release" is simply: a reviewed, Founder-approved
commit pushed to `main`. There is no deployment step yet — `main` is not
currently auto-deployed anywhere. Treat every push to `main` as if it
*could* be deployed at any time (i.e. `npm run build` must pass before
every push, per the existing `08_QA_CHECKLIST.md` acceptance criteria),
even though nothing currently consumes that guarantee automatically.

## What "release" will mean once migrations start shipping (forward-looking)

Once the first migration (`20260801120000_organizations_foundation.sql`)
completes `20_PRODUCTION_ACCEPTANCE_PLAN.md` and is applied to
Production, and once website code starts actually reading from Supabase
instead of demo data, a release becomes a **coordinated pair**:

1. **Database migration reaches Production first, and independently** —
   following its own full 8-stage pipeline
   (`21_GOVERNANCE.md` Rule 2) to completion, entirely decoupled from any
   specific website code deploy. A migration being "accepted" in
   Production does not imply any website code changes at the same time.
2. **Website code that depends on the new schema deploys after**, once
   the migration it depends on is already live in Production — never
   before. This ordering (schema before code that assumes it) is what
   prevents a deploy from hitting a database that isn't ready for it yet.
3. Corollary: website code should be written to **not break** if a
   dependent migration hasn't shipped yet wherever practical (e.g. keep
   `DemoLeadRepository` as the default until `SupabaseLeadRepository`
   Sprint work is both migrated *and* deployed — see
   `09_PHASE2_PLAN.md` Phase 2.1) — this avoids a hard coupling that
   would force database and code releases to happen in the same instant.

## Rollback at the release level (distinct from migration-level rollback)

- **Website code rollback**: standard git revert of the offending commit
  (or redeploy of a previous known-good commit, once a hosting platform
  with that capability is chosen) — no different from any other Next.js
  project, and not something this document needs to invent further
  detail for yet.
- **Database migration rollback**: governed entirely by that specific
  migration's own Rollback Plan artifact (Section 2, item 4 of
  `23_MIGRATION_POLICY.md`) — never a generic "release rollback" script.
  If a release involved both a migration and dependent code, and the
  migration needs to roll back, the dependent code must be rolled back
  **first** (reverse of the deploy order in the previous section) so the
  website is never left running against a schema state it doesn't
  expect.

## Versioning and tagging (forward-looking recommendation)

No git tags exist yet. Once releases start having real user-facing
significance (i.e. once this is deployed somewhere real users can reach),
adopt a simple tag per release (e.g. `v0.2.0` for whatever ships the
first Supabase-backed feature) so "what was live when" is answerable
later. This is a recommendation to adopt when it becomes relevant, not a
retroactive requirement on the one commit that exists today.

## File liên quan

- Governance rule this implements: [`21_GOVERNANCE.md`](./21_GOVERNANCE.md) Rule 6
- Day-to-day workflow: [`22_DEVELOPMENT_WORKFLOW.md`](./22_DEVELOPMENT_WORKFLOW.md)
- Migration artifact/rollback detail: [`23_MIGRATION_POLICY.md`](./23_MIGRATION_POLICY.md)
- Existing website quality gate: [`08_QA_CHECKLIST.md`](./08_QA_CHECKLIST.md)
- Deployment status/environment notes: [`07_DEPLOYMENT.md`](./07_DEPLOYMENT.md)
