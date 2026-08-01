# Supabase — schema proposal (not yet connected)

This folder is a **proposal**, not a live integration. No Supabase project is
configured, no migration has been run, and the website works fully without
it (see the demo mode explanation in the root `README.md`).

## What's here

- `migrations/0001_init.sql` — a starting-point schema for a `leads` table
  that mirrors `src/types/lead.ts`. Review and adjust before running it
  against a real project (indexes, RLS policies, and column choices are all
  open to change).

## How this connects to the app later

The app already isolates all lead storage behind one interface:
`src/services/lead-repository.ts` (`LeadRepository`). Today,
`src/services/get-lead-repository.ts` always returns the in-memory
`DemoLeadRepository`. To go live with Supabase:

1. Run (a reviewed version of) `migrations/0001_init.sql` against a real
   Supabase project.
2. Add `@supabase/supabase-js` as a dependency (not installed yet — kept out
   per the "minimal dependencies" principle until it's actually needed).
3. Create `src/services/supabase-lead-repository.ts` implementing
   `LeadRepository`, using the **server-side** Supabase client
   (`SUPABASE_SERVICE_ROLE_KEY`, read only in server code — see
   `.env.example`).
4. Update `get-lead-repository.ts` to return the Supabase implementation
   when the relevant env vars are present, falling back to the demo
   repository otherwise.

No page, form, or Server Action needs to change — they all call
`getLeadRepository().submitLead(lead)` today.

## Security notes

- Never import `@supabase/supabase-js` with the service role key in a
  `"use client"` file or any code that ships to the browser.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is safe to expose only if Row Level
  Security policies are correctly scoped — the proposed migration ships
  with RLS enabled and no public policies, so the anon key currently
  can't read or write anything until policies are added deliberately.
