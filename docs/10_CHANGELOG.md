# 10. Changelog

Định dạng: mỗi phase liệt kê phạm vi đã hoàn thành theo hạng mục, không
liệt kê từng commit (repo hiện chưa khởi tạo Git — xem
[`07_DEPLOYMENT.md`](./07_DEPLOYMENT.md)).

## Phase 1 — Xây dựng nền tảng (2026-08-01)

Khởi tạo toàn bộ website từ workspace trống.

**Tech stack**: Next.js 16 (App Router, Turbopack) + TypeScript strict +
Tailwind CSS v4 + Zod + Vitest.

**Đã hoàn thành**:
- Toàn bộ 12 trang theo IA gốc: Trang chủ, Giải pháp (list + detail),
  Sản phẩm (list + filter + detail), Tư vấn bác sĩ, Kiến thức (list +
  filter + detail), VETJOY App, Đại lý, Về VETJOY, Liên hệ, Chính sách
  bảo mật, Điều khoản sử dụng.
- Design system khởi tạo: token màu (Vet Green/Teal/Neutral) trong
  `globals.css`, font Be Vietnam Pro.
- Data layer + demo repository pattern: `src/data/` (dữ liệu mẫu, gắn
  `isDemo: true`), `src/services/` (đọc dữ liệu + `LeadRepository`
  interface cho ghi lead).
- 3 form thu lead (Tư vấn bác sĩ, Đại lý, Liên hệ) dùng React 19 Server
  Actions + Zod validation, giữ dữ liệu khi lỗi, chống submit lặp.
- SEO: metadata per-page, `sitemap.ts`, `robots.ts`, JSON-LD
  (Organization, BlogPosting).
- UTM capture (`lib/utm.ts`, `UtmTracker`) + analytics event abstraction
  (`lib/analytics.ts`).
- Test suite Vitest: 33 test — validation schema, Server Action (lead +
  giữ dữ liệu khi lỗi), UTM capture, product filtering, navigation config.
- `npm run lint`, `npm run build`, `npm test` — tất cả PASS.
- Tài liệu Supabase đề xuất (`supabase/README.md`,
  `supabase/migrations/0001_init.sql`) — chưa kết nối, chỉ là schema
  proposal.

**Bug đã phát hiện và sửa trong quá trình test qua browser thật**:
- Next.js 16: file `"use server"` chỉ được export async function — di
  chuyển `initial*State` (object) ra file `state.ts` riêng cho 3 feature
  (`consultation`, `dealer`, `contact`).
- React 19 tự động gọi `form.reset()` (native) mỗi khi Server Action
  được dispatch từ `<form action>`, làm mất giá trị `<select>` và
  checkbox sau khi submit lỗi (dù text input vẫn giữ được). Khắc phục
  bằng cách thêm `key={values.field ?? "unset"}` để remount phần tử với
  `defaultValue`/`defaultChecked` mới — áp dụng cho `customerType`,
  `businessScale`, và checkbox `consent` ở cả 3 form.

## Phase 1.5 — Nâng cấp giao diện & mức độ chuyên nghiệp (2026-08-01)

Không đổi kiến trúc, không thêm dependency mới. Toàn bộ thay đổi ở tầng
UI/component.

**Đã hoàn thành**:
- Bộ icon tự viết tay dùng chung (`components/ui/Icon.tsx`, ~30 icon,
  không dùng thư viện ngoài) + map icon theo danh mục
  (`lib/category-icons.ts`) dùng chung cho Product/Article/Solution card.
- `PlaceholderImage` nâng cấp: icon + gradient + nhãn "Hình ảnh minh họa"
  thay vì khung viền chấm đơn giản.
- Hero trang chủ viết lại: headline "GIẢI PHÁP THÚ Y TOÀN DIỆN — ĐỒNG
  HÀNH CÙNG NGƯỜI CHĂN NUÔI", 4 trust-point có icon, 2 CTA, badge nổi
  "20+ năm".
- Section mới **Why VETJOY** (6 lý do chọn VETJOY).
- Trust Bar, Problem Section, VETJOY CARE 5 (timeline có đường nối +
  icon, layout riêng cho mobile/desktop), Product Categories, Expert
  Section, App Teaser (phone mockup dựng bằng CSS), Testimonials,
  Knowledge cards, Final CTA — đều được thiết kế lại đồng bộ theo design
  system mới (`card-vj`, `card-vj-hover`, `icon-tile`, `.section-py`).
- Footer nâng cấp: icon mạng xã hội (Facebook/YouTube/TikTok/Zalo — ở
  trạng thái vô hiệu hoá vì chưa có link thật), khối bản đồ placeholder,
  giờ làm việc.
- **Floating Action Button** mới: Gọi điện / Chat Zalo / Messenger
  (placeholder) / Nhận tư vấn.
- `Button` component: thêm shadow + hover lift cho biến thể
  primary/secondary.
- Global CSS: thêm utility `.section-py`, `.card-vj`, `.card-vj-hover`,
  `.icon-tile`, keyframe `.animate-fade-up` (tôn trọng
  `prefers-reduced-motion`).
- `src/config/site.ts`: thêm `contact.workingHoursPlaceholder` và
  `social` (facebook/youtube/tiktok/zalo/messenger, đều `null` cho tới
  khi có link thật).
- Đã kiểm tra qua browser thật: không có horizontal scroll ở 375px và
  1280px, `focus-ring` còn nguyên trên mọi phần tử tương tác mới, icon
  placeholder chưa có link không lọt vào tab order.
- `npm run lint`, `npm run build`, `npm test` (33/33) — tất cả PASS sau
  khi hoàn tất.

## Phase 1.6 — Tài liệu hoá kỹ thuật (2026-08-01)

Không đổi code, không đổi giao diện. Chỉ tạo tài liệu.

**Đã hoàn thành**:
- Tạo thư mục `/docs` với 10 file tài liệu kỹ thuật (đánh số
  `01`–`10`), bao gồm tổng quan dự án, kiến trúc, cấu trúc thư mục,
  hướng dẫn component, design system, hướng dẫn nội dung/placeholder,
  deployment, QA checklist, kế hoạch Phase 2, và changelog này.
- Viết lại `README.md` gốc theo chuẩn GitHub chuyên nghiệp.
