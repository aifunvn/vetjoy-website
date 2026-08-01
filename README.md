# VETJOY Website

**Giải pháp thú y toàn diện, đồng hành cùng người chăn nuôi.**

Website Phase 1.5 cho **Công ty Thú y Chung Lương** (thương hiệu
**VETJOY**) — nền tảng thu lead chất lượng cho hệ sinh thái chăm sóc sức
khỏe vật nuôi: sản phẩm thú y, tư vấn bác sĩ trên 20 năm kinh nghiệm, và
định hướng công nghệ (VETJOY App, AI, CRM) ở các giai đoạn tiếp theo.

> ⚠️ **Toàn bộ dữ liệu sản phẩm, bài viết kiến thức, thông tin bác sĩ và
> testimonial trong repo này là DỮ LIỆU MẪU**, được đánh dấu rõ trong UI
> (`isDemo: true` / badge "DỮ LIỆU MẪU"). Không sử dụng để tư vấn chuyên
> môn hay quảng bá cho đến khi được Founder xác nhận và thay thế bằng dữ
> liệu thật — chi tiết ở [`docs/06_CONTENT_GUIDE.md`](./docs/06_CONTENT_GUIDE.md).

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
- [Ảnh chụp màn hình](#ảnh-chụp-màn-hình)
- [Tech stack](#tech-stack)
- [Cài đặt](#cài-đặt)
- [Chạy local](#chạy-local)
- [Build](#build)
- [Environment variables](#environment-variables)
- [Deploy](#deploy)
- [Kiến trúc & cấu trúc thư mục](#kiến-trúc--cấu-trúc-thư-mục)
- [Tài liệu kỹ thuật đầy đủ](#tài-liệu-kỹ-thuật-đầy-đủ)
- [Roadmap](#roadmap)
- [Bảo mật](#bảo-mật)

## Giới thiệu

VETJOY là hệ sinh thái chăm sóc sức khỏe vật nuôi kết hợp sản phẩm thú y,
chuyên môn bác sĩ và công nghệ theo dõi — không chỉ là nơi bán thuốc.
Website này là điểm chạm số đầu tiên trong hệ sinh thái đó, với mục tiêu
số 1 là **thu lead chất lượng**:

- Giúp khách (người chăn nuôi gia súc/gia cầm, chủ trang trại, người nuôi
  thú cưng, đại lý) hiểu VETJOY và tìm đúng giải pháp trong vài giây.
- Thu lead qua 3 form: **Tư vấn bác sĩ**, **Đăng ký đại lý**, **Liên hệ**.
- Xây nội dung chuyên môn (Knowledge Hub) để tạo niềm tin.
- Đặt nền móng kiến trúc (data model, service layer) để mở rộng thành
  CRM, VETJOY App và AI Assistant ở các phase sau.

Chi tiết mục tiêu, giá trị cốt lõi, persona khách hàng:
[`docs/01_PROJECT_OVERVIEW.md`](./docs/01_PROJECT_OVERVIEW.md).

## Ảnh chụp màn hình

_Chưa có ảnh chụp màn hình chính thức trong repo — giao diện hiện dùng
100% `PlaceholderImage` (icon + gradient) vì chưa có ảnh thật (xem
[`docs/06_CONTENT_GUIDE.md`](./docs/06_CONTENT_GUIDE.md)). Sau khi có ảnh
thật và giao diện được Founder duyệt để công bố, chụp màn hình trang chủ
(desktop + mobile) và đặt vào `public/screenshots/`, sau đó chèn lại vào
mục này theo cú pháp:_

```md
![Trang chủ VETJOY — desktop](./public/screenshots/home-desktop.png)
![Trang chủ VETJOY — mobile](./public/screenshots/home-mobile.png)
```

## Tech stack

| Thành phần | Lựa chọn | Lý do |
| --- | --- | --- |
| Framework | **Next.js 16 (App Router, Turbopack)** | SSR/SEO tốt cho website thu lead qua tìm kiếm tự nhiên; Server Actions xử lý form không cần API riêng |
| Ngôn ngữ | **TypeScript (strict)** | An toàn kiểu dữ liệu cho data model Lead/Product/Article |
| Styling | **Tailwind CSS v4** | Design token tập trung trong `src/app/globals.css` |
| Validation | **Zod** | Validation schema dùng chung client + Server Action |
| Testing | **Vitest** + jsdom | Nhẹ, nhanh, không cần trình duyệt thật để chạy CI |

Giải thích đầy đủ lý do chọn từng công nghệ:
[`docs/02_ARCHITECTURE.md`](./docs/02_ARCHITECTURE.md).

## Cài đặt

Yêu cầu Node.js 20.9+.

```bash
npm install
```

## Chạy local

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Không cần biến môi
trường nào — website chạy đầy đủ ở **demo mode** (dữ liệu mẫu, lead lưu
tạm trong bộ nhớ server).

## Build

```bash
npm run build
npm run start   # chạy bản production đã build
```

Kiểm tra chất lượng trước khi release:

```bash
npm run lint    # ESLint
npm test        # Vitest
```

Trạng thái hiện tại: **build/lint/test đều PASS** (0 lỗi ESLint, 33/33
test Vitest pass).

## Environment variables

Xem [`.env.example`](./.env.example). Không có biến nào bắt buộc ở Phase
1 — các biến `SUPABASE_*` chỉ dùng khi kết nối backend thật (xem
[`docs/09_PHASE2_PLAN.md`](./docs/09_PHASE2_PLAN.md)). Không bao giờ
commit file `.env.local` thật.

## Deploy

Chưa có domain/nền tảng hosting chính thức — quyết định này cần Founder
xác nhận trước (ảnh hưởng chi phí). Hướng dẫn kỹ thuật đầy đủ (yêu cầu
runtime, biến môi trường, lưu ý bảo mật khi deploy):
[`docs/07_DEPLOYMENT.md`](./docs/07_DEPLOYMENT.md).

## Kiến trúc & cấu trúc thư mục

```
src/
├── app/            # Routes (App Router) — 1 thư mục = 1 URL
├── components/     # UI dùng chung (ui/) + section theo trang (home/...)
├── features/       # Form + Server Action theo domain (consultation, dealer, contact)
├── services/       # Lớp truy cập dữ liệu — seam để thay demo data bằng Supabase
├── data/           # Dữ liệu mẫu (products, articles, solutions...)
├── lib/            # Tiện ích thuần: validation, utm, analytics, icon map
├── types/          # Type dùng chung (Product, Article, Lead...)
└── config/         # site.ts — brand identity, nav, contact (nguồn duy nhất)
supabase/           # Schema đề xuất cho backend tương lai (chưa kết nối)
docs/               # Bộ tài liệu kỹ thuật đầy đủ
```

Giải thích chi tiết từng thư mục:
[`docs/03_FOLDER_STRUCTURE.md`](./docs/03_FOLDER_STRUCTURE.md). Hướng
dẫn từng component (mục đích, props, cách mở rộng):
[`docs/04_COMPONENT_GUIDE.md`](./docs/04_COMPONENT_GUIDE.md). Quy tắc
thiết kế (màu, spacing, typography, shadow, animation):
[`docs/05_DESIGN_SYSTEM.md`](./docs/05_DESIGN_SYSTEM.md).

## Tài liệu kỹ thuật đầy đủ

Toàn bộ tài liệu bàn giao nằm trong [`/docs`](./docs):

| File | Nội dung |
| --- | --- |
| [`01_PROJECT_OVERVIEW.md`](./docs/01_PROJECT_OVERVIEW.md) | Mục tiêu, giá trị cốt lõi, persona khách hàng, roadmap tổng quan |
| [`02_ARCHITECTURE.md`](./docs/02_ARCHITECTURE.md) | Next.js/App Router/Tailwind, component structure, data flow, SEO/responsive strategy |
| [`03_FOLDER_STRUCTURE.md`](./docs/03_FOLDER_STRUCTURE.md) | Giải thích từng thư mục trong `src/` |
| [`04_COMPONENT_GUIDE.md`](./docs/04_COMPONENT_GUIDE.md) | Mục đích/props/cách mở rộng của từng component chính |
| [`05_DESIGN_SYSTEM.md`](./docs/05_DESIGN_SYSTEM.md) | Typography, màu, spacing, radius, shadow, animation, icon |
| [`06_CONTENT_GUIDE.md`](./docs/06_CONTENT_GUIDE.md) | Nội dung nào là placeholder, Founder cần cung cấp gì |
| [`07_DEPLOYMENT.md`](./docs/07_DEPLOYMENT.md) | Local, build, environment, deploy |
| [`08_QA_CHECKLIST.md`](./docs/08_QA_CHECKLIST.md) | Checklist kiểm thử desktop/tablet/mobile/SEO/a11y/form/404 |
| [`09_PHASE2_PLAN.md`](./docs/09_PHASE2_PLAN.md) | Roadmap chi tiết: Supabase, CMS, CRM, BCM, AI, Automation |
| [`10_CHANGELOG.md`](./docs/10_CHANGELOG.md) | Lịch sử Phase 1 / 1.5 / 1.6 đã làm gì |

## Roadmap

- ✅ **Phase 1** — Nền tảng: toàn bộ trang, 3 form thu lead, SEO, a11y,
  demo data, test, build.
- ✅ **Phase 1.5** — Nâng cấp giao diện: Hero, Why VETJOY, timeline có
  icon, hệ thống icon riêng, Floating Action Button.
- ✅ **Phase 1.6** — Tài liệu hoá kỹ thuật (bộ tài liệu này).
- 🔜 **Phase 2** — Supabase (lưu trữ lead thật), CMS, CRM/Business Core,
  AI Assistant, Automation, Analytics thật. Chi tiết đầy đủ:
  [`docs/09_PHASE2_PLAN.md`](./docs/09_PHASE2_PLAN.md).

## Bảo mật

- Không có secret nào trong code/frontend; `SUPABASE_SERVICE_ROLE_KEY`
  (khi thêm ở Phase 2) chỉ đọc ở server-side.
- Toàn bộ form validate bằng Zod ở Server Action, không chỉ ở client.
- Không render HTML không tin cậy — điểm `dangerouslySetInnerHTML` duy
  nhất (`JsonLd.tsx`) chỉ nhận dữ liệu nội bộ cho SEO.
- `npm audit` báo lỗ hổng "high" nằm trong `postcss`/`sharp` — là
  dependency **nội bộ của chính Next.js 16.2.12** (build-time only); bản
  vá đề xuất sẽ hạ Next.js xuống bản rất cũ nên **chưa áp dụng**, đang
  theo dõi bản cập nhật chính thức.

Chi tiết đầy đủ: [`docs/07_DEPLOYMENT.md`](./docs/07_DEPLOYMENT.md#lưu-ý-bảo-mật-khi-deploy).
