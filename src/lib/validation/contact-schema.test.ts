import { describe, expect, it } from "vitest";
import { contactSchema } from "./contact-schema";

const validPayload = {
  fullName: "Lê Văn C",
  phone: "0912345678",
  message: "Tôi cần hỗ trợ thêm thông tin",
  consent: "on",
};

describe("contactSchema", () => {
  it("accepts a fully valid payload without email", () => {
    expect(contactSchema.safeParse(validPayload).success).toBe(true);
  });

  it("accepts a valid email when provided", () => {
    const result = contactSchema.safeParse({ ...validPayload, email: "test@example.com" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = contactSchema.safeParse({ ...validPayload, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects a message that is too short", () => {
    const result = contactSchema.safeParse({ ...validPayload, message: "hi" });
    expect(result.success).toBe(false);
  });
});
