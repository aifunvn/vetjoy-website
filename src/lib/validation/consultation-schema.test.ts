import { describe, expect, it } from "vitest";
import { consultationSchema } from "./consultation-schema";

const validPayload = {
  fullName: "Nguyễn Văn A",
  phone: "0901234567",
  customerType: "gia_suc",
  animalType: "Heo",
  onsetTime: "2 ngày trước",
  mainSymptoms: "Bỏ ăn, mệt mỏi",
  supportNeeded: "Cần tư vấn hướng xử lý",
  consent: "on",
};

describe("consultationSchema", () => {
  it("accepts a fully valid payload", () => {
    const result = consultationSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("normalizes a phone number with spaces and dashes", () => {
    const result = consultationSchema.safeParse({
      ...validPayload,
      phone: "090-123 4567",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("0901234567");
    }
  });

  it("rejects an invalid phone number", () => {
    const result = consultationSchema.safeParse({ ...validPayload, phone: "123" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const phoneIssue = result.error.issues.find((i) => i.path[0] === "phone");
      expect(phoneIssue).toBeDefined();
    }
  });

  it("rejects when consent is not given", () => {
    const { consent: _consent, ...rest } = validPayload;
    const result = consultationSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an unknown customerType", () => {
    const result = consultationSchema.safeParse({
      ...validPayload,
      customerType: "not_a_real_type",
    });
    expect(result.success).toBe(false);
  });

  it("rejects mainSymptoms that are too short", () => {
    const result = consultationSchema.safeParse({ ...validPayload, mainSymptoms: "ab" });
    expect(result.success).toBe(false);
  });

  it("carries optional utm_* fields through when present", () => {
    const result = consultationSchema.safeParse({
      ...validPayload,
      utm_source: "facebook",
      utm_campaign: "spring-promo",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.utm_source).toBe("facebook");
      expect(result.data.utm_campaign).toBe("spring-promo");
    }
  });
});
