# 07. Hướng dẫn Build & Deploy

## Yêu cầu môi trường

- Node.js 20.9+ (yêu cầu tối thiểu của Next.js 16).
- npm (repo dùng `package-lock.json`, không dùng yarn/pnpm).

## Chạy Local (development)

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000). Không cần biến môi
trường nào — website chạy đầy đủ ở **demo mode** (dữ liệu mẫu trong
`src/data/`, lead lưu tạm trong bộ nhớ qua `DemoLeadRepository`, mất khi
restart server — xem `docs/02_ARCHITECTURE.md`).

## Build production

```bash
npm run build
npm run start   # chạy bản đã build, mặc định port 3000
```

`npm run build` phải chạy qua 2 bước không lỗi: compile (Turbopack) và
type-check TypeScript (strict mode). Nếu build lỗi, sửa lỗi type trước —
không dùng `// @ts-ignore` để né lỗi.

## Kiểm tra chất lượng trước khi deploy

```bash
npm run lint    # ESLint — phải 0 lỗi, 0 cảnh báo
npm test        # Vitest — phải 100% pass
npm run build   # phải build thành công
```

Xem đầy đủ checklist thủ công (responsive, a11y, form...) tại
[`08_QA_CHECKLIST.md`](./08_QA_CHECKLIST.md).

## Environment variables

Xem `.env.example` ở thư mục gốc. Tóm tắt:

| Biến | Bắt buộc ở Phase 1? | Ghi chú |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Không | Dùng cho canonical/sitemap/OG khi có domain thật |
| `NEXT_PUBLIC_SUPABASE_URL` | Không | Chỉ dùng khi kết nối Supabase (Phase 2) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Không | Chỉ dùng khi kết nối Supabase (Phase 2) |
| `SUPABASE_SERVICE_ROLE_KEY` | Không | **Chỉ đọc ở server-side**, không bao giờ đưa vào file `"use client"` |

Không có biến môi trường nào là bắt buộc để `npm run dev`/`npm run build`
chạy thành công ở trạng thái hiện tại của repo.

## Deploy

⚠️ **Chưa có quyết định chính thức về domain hay nền tảng hosting** — đây
là quyết định ảnh hưởng chi phí, cần Founder xác nhận trước khi thực hiện
(theo đúng nguyên tắc "dừng lại và báo Founder trước khi quyết định ảnh
hưởng chi phí/domain" của dự án).

Về mặt kỹ thuật, đây là một ứng dụng Next.js App Router chuẩn, không có
gì đặc thù chặn việc deploy — có thể chạy trên bất kỳ nền tảng nào hỗ trợ
Next.js server runtime (không phải static export thuần, vì có Server
Actions và route động `san-pham`, `kien-thuc`). Trước khi chọn nền tảng,
cần xác nhận:

1. Nền tảng có hỗ trợ Next.js Server Actions + Node.js runtime hay không
   (không thể deploy dạng static-only site).
2. Domain chính thức để cập nhật `siteConfig.url` (`src/config/site.ts`)
   và `NEXT_PUBLIC_SITE_URL`.
3. Có cần Supabase/database thật ngay hay vẫn giữ demo mode ở lần deploy
   đầu tiên (xem `docs/09_PHASE2_PLAN.md`).

## Lưu ý bảo mật khi deploy

- Không commit file `.env.local` thật (đã có trong `.gitignore`).
- Không đặt `SUPABASE_SERVICE_ROLE_KEY` (hoặc bất kỳ secret nào) vào biến
  môi trường có tiền tố `NEXT_PUBLIC_` — tiền tố này khiến giá trị bị nhúng
  thẳng vào bundle JavaScript gửi tới trình duyệt.
- `npm audit` hiện báo lỗ hổng "high" nằm trong `postcss`/`sharp` — đây là
  dependency **nội bộ của chính Next.js 16.2.12** (build-time only), bản
  vá do `npm audit fix --force` đề xuất sẽ hạ Next.js xuống bản rất cũ
  (breaking change) nên **chưa áp dụng**. Theo dõi bản cập nhật chính
  thức của Next.js thay vì downgrade thủ công.
