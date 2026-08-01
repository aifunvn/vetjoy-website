import type { Lead, SubmitResult } from "@/types";
import type { LeadRepository } from "./lead-repository";

/**
 * In-memory demo repository. Leads are held only in the running server
 * process's memory and are lost on restart/redeploy — this is intentional
 * for local/demo mode and must be replaced by a persistent repository
 * (e.g. Supabase) before relying on lead capture in production.
 */
class DemoLeadRepository implements LeadRepository {
  private leads: Lead[] = [];

  async submitLead(lead: Lead): Promise<SubmitResult> {
    this.leads.push(lead);
    if (process.env.NODE_ENV !== "production") {
      console.info(
        `[demo-lead-repository] Đã ghi nhận lead (${lead.leadType}): ${lead.leadId}`
      );
    }
    return { success: true, leadId: lead.leadId };
  }

  /** Test/demo helper only — not part of the LeadRepository interface. */
  getAll(): Lead[] {
    return this.leads;
  }
}

export const demoLeadRepository = new DemoLeadRepository();
