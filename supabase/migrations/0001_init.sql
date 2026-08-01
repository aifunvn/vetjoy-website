-- VETJOY — Lead table schema PROPOSAL.
-- This migration has NOT been run against any Supabase project. It is a
-- starting point for the Founder / a backend engineer to review before
-- applying it to a real database. See supabase/README.md for context.

create table if not exists public.leads (
  lead_id uuid primary key default gen_random_uuid(),
  lead_type text not null check (
    lead_type in (
      'veterinary_consultation',
      'product_interest',
      'dealer',
      'contact',
      'app_interest'
    )
  ),
  status text not null default 'new' check (
    status in ('new', 'contacted', 'qualified', 'closed')
  ),

  -- Common contact fields, shared across every lead type.
  full_name text not null,
  phone text not null,
  zalo text,
  email text,

  -- Free-form fields specific to each lead_type (breed, herd_size,
  -- main_symptoms, business_name, cooperation_needs, message, ...).
  -- Kept as JSONB rather than one column per possible field because the
  -- three lead types share little beyond contact info — see
  -- src/types/lead.ts for the exact shape written per lead_type.
  details jsonb not null default '{}'::jsonb,

  -- Attribution.
  source text not null,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_lead_type_idx on public.leads (lead_type);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_created_at_idx on public.leads (created_at desc);

alter table public.leads enable row level security;

-- No public policies are defined: by default, only requests using the
-- service role key (server-side only, e.g. from a Server Action) can read
-- or write this table. Add narrowly-scoped policies here if a future
-- authenticated CRM UI needs direct client access.
