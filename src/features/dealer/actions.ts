"use server";

import { dealerSchema } from "@/lib/validation/dealer-schema";
import { getLeadRepository } from "@/services/get-lead-repository";
import { generateId } from "@/lib/id";
import type { DealerLead } from "@/types";
import type { ConsultationActionState } from "@/features/consultation/state";

export async function submitDealerAction(
  _prevState: ConsultationActionState,
  formData: FormData
): Promise<ConsultationActionState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = dealerSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      status: "error",
      message: "Vui lòng kiểm tra lại thông tin đã nhập bên dưới.",
      fieldErrors,
      values: raw,
    };
  }

  const now = new Date().toISOString();
  const data = parsed.data;
  const lead: DealerLead = {
    leadId: generateId("lead"),
    leadType: "dealer",
    fullName: data.fullName,
    phone: data.phone,
    zalo: data.zalo || undefined,
    businessName: data.businessName,
    areaAddress: data.areaAddress,
    currentProducts: data.currentProducts || undefined,
    businessScale: data.businessScale,
    cooperationNeeds: data.cooperationNeeds,
    consentGiven: true,
    source: "/dai-ly",
    status: "new",
    createdAt: now,
    updatedAt: now,
    utm_source: data.utm_source || undefined,
    utm_medium: data.utm_medium || undefined,
    utm_campaign: data.utm_campaign || undefined,
    utm_content: data.utm_content || undefined,
    utm_term: data.utm_term || undefined,
  };

  const result = await getLeadRepository().submitLead(lead);

  if (!result.success) {
    return {
      status: "error",
      message:
        result.error ??
        "Có lỗi xảy ra khi gửi đăng ký. Vui lòng thử lại sau ít phút.",
      values: raw,
    };
  }

  return {
    status: "success",
    message:
      "Cảm ơn bạn đã đăng ký! VETJOY sẽ liên hệ lại để trao đổi về hợp tác đại lý.",
  };
}
