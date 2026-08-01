import { z } from "zod";
import { fullNameSchema, phoneSchema, consentSchema, utmFieldsSchema } from "./shared";

export const contactSchema = z
  .object({
    fullName: fullNameSchema,
    phone: phoneSchema,
    email: z.string().trim().email("Email không hợp lệ.").optional().or(z.literal("")),
    message: z
      .string()
      .trim()
      .min(5, "Vui lòng nhập nội dung liên hệ (tối thiểu 5 ký tự).")
      .max(2000),
    consent: consentSchema,
  })
  .extend(utmFieldsSchema.shape);

export type ContactFormValues = z.infer<typeof contactSchema>;
