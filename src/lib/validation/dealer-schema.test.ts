import { describe, expect, it } from "vitest";
import { dealerSchema } from "./dealer-schema";

const validPayload = {
  fullName: "Trần Thị B",
  phone: "0909876543",
  businessName: "Cửa hàng thú y ABC",
  areaAddress: "Quận 1, TP.HCM",
  businessScale: "cua_hang",
  cooperationNeeds: "Muốn trở thành đại lý phân phối",
  consent: "on",
};

describe("dealerSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(dealerSchema.safeParse(validPayload).success).toBe(true);
  });

  it("rejects a missing business name", () => {
    const { businessName: _businessName, ...rest } = validPayload;
    expect(dealerSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects an invalid business scale", () => {
    const result = dealerSchema.safeParse({ ...validPayload, businessScale: "unknown" });
    expect(result.success).toBe(false);
  });

  it("rejects when consent checkbox is unchecked (field absent)", () => {
    const { consent: _consent, ...rest } = validPayload;
    expect(dealerSchema.safeParse(rest).success).toBe(false);
  });

  it("accepts an international-format phone number", () => {
    const result = dealerSchema.safeParse({ ...validPayload, phone: "+84901234567" });
    expect(result.success).toBe(true);
  });
});
