import { z } from "zod";

/** Strips spaces, dots and dashes so "090 123 4567" and "090-123-4567" both validate. */
export function normalizePhone(input: string): string {
  return input.replace(/[\s.-]/g, "");
}

const VN_PHONE_REGEX = /^(\+84|0)\d{9,10}$/;

export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Vui lòng nhập số điện thoại.")
  .transform(normalizePhone)
  .refine((v) => VN_PHONE_REGEX.test(v), {
    message: "Số điện thoại không hợp lệ. Ví dụ: 0901234567.",
  });

export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Vui lòng nhập họ tên (tối thiểu 2 ký tự).")
  .max(100, "Họ tên quá dài.");

export const consentSchema = z.literal("on", {
  message: "Vui lòng đồng ý để VETJOY liên hệ và hỗ trợ bạn.",
});

export const utmFieldsSchema = z.object({
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  utm_content: z.string().optional(),
  utm_term: z.string().optional(),
});
