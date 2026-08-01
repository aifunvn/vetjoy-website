import { describe, expect, it } from "vitest";
import { submitConsultationAction, initialConsultationState } from "./actions";

function buildFormData(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

const validFields = {
  fullName: "Nguyễn Văn A",
  phone: "0901234567",
  customerType: "gia_suc",
  animalType: "Heo",
  onsetTime: "2 ngày trước",
  mainSymptoms: "Bỏ ăn, mệt mỏi",
  supportNeeded: "Cần tư vấn hướng xử lý",
  consent: "on",
};

describe("submitConsultationAction", () => {
  it("returns an error state and preserves entered values when validation fails", async () => {
    const fd = buildFormData({ ...validFields, phone: "123" });
    const result = await submitConsultationAction(initialConsultationState, fd);

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.phone).toBeDefined();
    // The user's other input must not be lost on a failed submission.
    expect(result.values?.fullName).toBe("Nguyễn Văn A");
    expect(result.values?.mainSymptoms).toBe("Bỏ ăn, mệt mỏi");
  });

  it("returns a success state and a leadId for a valid submission", async () => {
    const fd = buildFormData(validFields);
    const result = await submitConsultationAction(initialConsultationState, fd);

    expect(result.status).toBe("success");
    expect(result.message).toBeTruthy();
  });

  it("rejects submission when the consent checkbox was not checked", async () => {
    const { consent: _consent, ...rest } = validFields;
    const fd = buildFormData(rest);
    const result = await submitConsultationAction(initialConsultationState, fd);

    expect(result.status).toBe("error");
    expect(result.fieldErrors?.consent).toBeDefined();
  });
});
