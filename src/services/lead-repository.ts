import type { Lead, SubmitResult } from "@/types";

/**
 * Repository seam for lead storage.
 * Swap DemoLeadRepository for a SupabaseLeadRepository later WITHOUT changing
 * any UI or server action call sites — see README "Kết nối Supabase sau này".
 */
export interface LeadRepository {
  submitLead(lead: Lead): Promise<SubmitResult>;
}
