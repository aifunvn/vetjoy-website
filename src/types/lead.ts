import type { UtmParams } from "./common";

export type LeadType =
  | "veterinary_consultation"
  | "product_interest"
  | "dealer"
  | "contact"
  | "app_interest";

export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

/**
 * Base lead shape shared by every lead-capturing form on the site.
 * This is the seam the future CRM will read from — see README "Future architecture".
 */
export interface LeadBase extends UtmParams {
  leadId: string;
  leadType: LeadType;
  fullName: string;
  phone: string;
  zalo?: string;
  email?: string;
  source: string; // page path the lead was submitted from
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ConsultationLead extends LeadBase {
  leadType: "veterinary_consultation";
  customerType: "gia_suc" | "gia_cam" | "thu_cung" | "trang_trai" | "dai_ly" | "khac";
  animalType: string;
  breed?: string;
  age?: string;
  herdSize?: string;
  affectedCount?: string;
  onsetTime: string;
  mainSymptoms: string;
  productsUsed?: string;
  currentResult?: string;
  supportNeeded: string;
  consentGiven: true;
}

export interface DealerLead extends LeadBase {
  leadType: "dealer";
  businessName: string;
  areaAddress: string;
  currentProducts?: string;
  businessScale: string;
  cooperationNeeds: string;
  consentGiven: true;
}

export interface ContactLead extends LeadBase {
  leadType: "contact";
  message: string;
  consentGiven: true;
}

export type Lead = ConsultationLead | DealerLead | ContactLead;

export interface SubmitResult {
  success: boolean;
  leadId?: string;
  error?: string;
}
