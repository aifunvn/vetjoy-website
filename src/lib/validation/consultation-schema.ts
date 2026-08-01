import { z } from "zod";
import { fullNameSchema, phoneSchema, consentSchema, utmFieldsSchema } from "./shared";

export const consultationCustomerTypes = [
  { value: "gia_suc", label: "Người chăn nuôi gia súc" },
  { value: "gia_cam", label: "Người chăn nuôi gia cầm" },
  { value: "trang_trai", label: "Chủ trang trại" },
  { value: "thu_cung", label: "Người nuôi chó, mèo, thú cưng" },
  { value: "dai_ly", label: "Đại lý / cửa hàng thú y" },
  { value: "khac", label: "Khác" },
] as const;

export const consultationSchema = z
  .object({
    fullName: fullNameSchema,
    phone: phoneSchema,
    zalo: z.string().trim().max(30).optional().or(z.literal("")),
    customerType: z.enum(
      consultationCustomerTypes.map((c) => c.value) as [string, ...string[]],
      { message: "Vui lòng chọn đối tượng phù hợp." }
    ),
    animalType: z.string().trim().min(1, "Vui lòng cho biết loại vật nuôi."),
    breed: z.string().trim().max(100).optional().or(z.literal("")),
    age: z.string().trim().max(50).optional().or(z.literal("")),
    herdSize: z.string().trim().max(50).optional().or(z.literal("")),
    affectedCount: z.string().trim().max(50).optional().or(z.literal("")),
    onsetTime: z.string().trim().min(1, "Vui lòng cho biết thời gian xuất hiện."),
    mainSymptoms: z
      .string()
      .trim()
      .min(5, "Vui lòng mô tả biểu hiện chính (tối thiểu 5 ký tự).")
      .max(2000),
    productsUsed: z.string().trim().max(1000).optional().or(z.literal("")),
    currentResult: z.string().trim().max(1000).optional().or(z.literal("")),
    supportNeeded: z
      .string()
      .trim()
      .min(5, "Vui lòng cho biết nội dung muốn được hỗ trợ.")
      .max(2000),
    consent: consentSchema,
  })
  .extend(utmFieldsSchema.shape);

export type ConsultationFormValues = z.infer<typeof consultationSchema>;
