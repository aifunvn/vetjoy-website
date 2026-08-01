import { z } from "zod";
import { fullNameSchema, phoneSchema, consentSchema, utmFieldsSchema } from "./shared";

export const dealerBusinessScales = [
  { value: "ho_kinh_doanh_nho", label: "Hộ kinh doanh nhỏ" },
  { value: "cua_hang", label: "Cửa hàng" },
  { value: "dai_ly_khu_vuc", label: "Đại lý khu vực" },
  { value: "nha_phan_phoi", label: "Nhà phân phối" },
] as const;

export const dealerSchema = z
  .object({
    fullName: fullNameSchema,
    phone: phoneSchema,
    zalo: z.string().trim().max(30).optional().or(z.literal("")),
    businessName: z
      .string()
      .trim()
      .min(2, "Vui lòng nhập tên cửa hàng/doanh nghiệp.")
      .max(200),
    areaAddress: z
      .string()
      .trim()
      .min(2, "Vui lòng nhập địa chỉ/khu vực kinh doanh.")
      .max(300),
    currentProducts: z.string().trim().max(1000).optional().or(z.literal("")),
    businessScale: z.enum(
      dealerBusinessScales.map((s) => s.value) as [string, ...string[]],
      { message: "Vui lòng chọn quy mô kinh doanh." }
    ),
    cooperationNeeds: z
      .string()
      .trim()
      .min(5, "Vui lòng mô tả nhu cầu hợp tác (tối thiểu 5 ký tự).")
      .max(2000),
    consent: consentSchema,
  })
  .extend(utmFieldsSchema.shape);

export type DealerFormValues = z.infer<typeof dealerSchema>;
