/**
 * Central business identity config.
 * This is the seam for a future Business Core: Website, CRM, Content System and
 * an AI Agent should all be able to read brand identity from one source of truth.
 * Values marked "PLACEHOLDER" must be confirmed by the Founder before go-live.
 */
export const siteConfig = {
  brandName: "VETJOY",
  companyName: "Công ty Thú y Chung Lương",
  slogan: "VETJOY – Bác sĩ thú y đồng hành cùng bạn.",
  description:
    "VETJOY kết hợp sản phẩm thú y, kinh nghiệm chuyên môn trên 20 năm và công nghệ để đồng hành cùng bạn trong quá trình chăm sóc vật nuôi.",
  // PLACEHOLDER: xác nhận domain chính thức trước khi triển khai production.
  url: "https://vetjoy.example.com",
  // PLACEHOLDER: Founder cần cung cấp số điện thoại/Zalo hotline thật.
  contact: {
    phoneDisplay: "1900 xxxx (placeholder)",
    phoneHref: "tel:1900000000",
    zaloHref: "https://zalo.me/0000000000",
    email: "lienhe@vetjoy.example.com",
    addressPlaceholder: "PLACEHOLDER: Địa chỉ trụ sở Công ty Thú y Chung Lương",
    workingHoursPlaceholder: "PLACEHOLDER: Thứ 2 – Thứ 7, 8:00 – 17:30",
  },
  // PLACEHOLDER: chưa có link mạng xã hội chính thức — Founder xác nhận trước khi bật.
  // Giữ giá trị null cho tới khi có link thật; Footer/FAB tự ẩn/disable khi null.
  social: {
    facebook: null as string | null,
    youtube: null as string | null,
    tiktok: null as string | null,
    zalo: null as string | null,
    messenger: null as string | null,
  },
} as const;

export interface NavItem {
  label: string;
  href: string;
}

export const primaryNav: NavItem[] = [
  { label: "Trang chủ", href: "/" },
  { label: "Giải pháp", href: "/giai-phap" },
  { label: "Sản phẩm", href: "/san-pham" },
  { label: "Tư vấn bác sĩ", href: "/tu-van-bac-si" },
  { label: "Kiến thức", href: "/kien-thuc" },
  { label: "VETJOY App", href: "/vetjoy-app" },
  { label: "Về VETJOY", href: "/ve-vetjoy" },
];

export const footerNav: NavItem[] = [
  { label: "Dành cho đại lý", href: "/dai-ly" },
  { label: "Liên hệ", href: "/lien-he" },
  { label: "Chính sách bảo mật", href: "/chinh-sach-bao-mat" },
  { label: "Điều khoản sử dụng", href: "/dieu-khoan-su-dung" },
];

export const headerCta: NavItem = {
  label: "Nhận tư vấn",
  href: "/tu-van-bac-si",
};
