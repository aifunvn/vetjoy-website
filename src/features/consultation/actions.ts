"use server";

import { consultationSchema } from "@/lib/validation/consultation-schema";
import { getLeadRepository } from "@/services/get-lead-repository";
import { generateId } from "@/lib/id";
import type { ConsultationLead } from "@/types";
import type { ConsultationActionState } from "./state";

export async function submitConsultationAction(
  _prevState: ConsultationActionState,
  formData: FormData
): Promise<ConsultationActionState> {
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = consultationSchema.safeParse(raw);

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
  const lead: ConsultationLead = {
    leadId: generateId("lead"),
    leadType: "veterinary_consultation",
    fullName: data.fullName,
    phone: data.phone,
    zalo: data.zalo || undefined,
    customerType: data.customerType as ConsultationLead["customerType"],
    animalType: data.animalType,
    breed: data.breed || undefined,
    age: data.age || undefined,
    herdSize: data.herdSize || undefined,
    affectedCount: data.affectedCount || undefined,
    onsetTime: data.onsetTime,
    mainSymptoms: data.mainSymptoms,
    productsUsed: data.productsUsed || undefined,
    currentResult: data.currentResult || undefined,
    supportNeeded: data.supportNeeded,
    consentGiven: true,
    source: "/tu-van-bac-si",
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
        "Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau ít phút.",
      values: raw,
    };
  }

  return {
    status: "success",
    message:
      "Cảm ơn bạn! VETJOY đã ghi nhận yêu cầu tư vấn và sẽ liên hệ lại sớm nhất có thể.",
  };
}
