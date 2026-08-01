import type { LeadRepository } from "./lead-repository";
import { demoLeadRepository } from "./demo-lead-repository";

/**
 * Single place that decides which LeadRepository implementation is active.
 * Today this always returns the in-memory demo repository because no
 * persistent backend is configured. When Supabase is wired up, add a
 * SupabaseLeadRepository and branch on server-side env vars here —
 * no other file in the app needs to change.
 */
export function getLeadRepository(): LeadRepository {
  return demoLeadRepository;
}
