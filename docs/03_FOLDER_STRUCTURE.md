# 03. Cấu trúc thư mục

Cây thư mục dưới đây phản ánh đúng trạng thái repo tại thời điểm viết tài
liệu này (sau Phase 1.5). Không có thư mục `sections/` hay `styles/`
riêng — phần tương đương được đặt trong `components/home/` và
`app/globals.css` (xem giải thích bên dưới).

```
vetjoy-website/
├── docs/                        # Bộ tài liệu kỹ thuật (thư mục này)
├── public/                      # Static asset — hiện chỉ còn SVG mặc định
│                                 # của create-next-app (file/globe/next/vercel/
│                                 # window.svg), KHÔNG được dùng ở đâu trong code.
│                                 # An toàn để xoá khi có ảnh/logo thật.
├── supabase/                    # Đề xuất schema cho backend tương lai (chưa kết nối)
│   ├── migrations/0001_init.sql
│   └── README.md
├── src/
│   ├── app/                     # App Router — 1 thư mục con = 1 route
│   ├── components/              # UI components, chia theo phạm vi dùng
│   ├── features/                # Logic + form theo nghiệp vụ (có side-effect)
│   ├── services/                # Lớp truy cập dữ liệu (đọc & ghi)
│   ├── data/                    # Dữ liệu mẫu (demo data)
│   ├── lib/                     # Hàm tiện ích thuần (không side-effect)
│   ├── types/                   # Type TypeScript dùng chung toàn dự án
│   └── config/                  # Cấu hình định danh thương hiệu, nav, contact
├── .env.example                 # Mẫu biến môi trường (không có secret thật)
├── vitest.config.mts            # Cấu hình test
├── eslint.config.mjs
├── next.config.ts
├── package.json
└── README.md
```

## `src/app/` — Routes

Mỗi route là một thư mục chứa `page.tsx`; `[slug]` là dynamic route.

```
app/
├── layout.tsx                   # Root layout: Header, Footer, FAB, JSON-LD, font
├── page.tsx                     # Trang chủ — ghép các section trong components/home
├── globals.css                  # TOÀN BỘ design token + utility class dùng chung
├── sitemap.ts / robots.ts       # SEO — tự sinh từ services/data hiện có
├── giai-phap/
│   ├── page.tsx                 # Danh sách giải pháp
│   └── [slug]/page.tsx          # Chi tiết 1 giải pháp
├── san-pham/
│   ├── page.tsx                 # Thư viện sản phẩm (search + filter qua URL)
│   └── [slug]/page.tsx          # Chi tiết sản phẩm
├── kien-thuc/
│   ├── page.tsx                 # Knowledge Hub (search + filter)
│   └── [slug]/page.tsx          # Chi tiết bài viết
├── tu-van-bac-si/page.tsx       # Conversion page quan trọng nhất
├── dai-ly/page.tsx              # Landing + form đăng ký đại lý
├── lien-he/page.tsx             # Form liên hệ chung
├── vetjoy-app/page.tsx          # Trang "sắp ra mắt"
├── ve-vetjoy/page.tsx           # Câu chuyện thương hiệu
├── chinh-sach-bao-mat/page.tsx  # Placeholder pháp lý
└── dieu-khoan-su-dung/page.tsx  # Placeholder pháp lý
```

## `src/components/` — UI, chia theo phạm vi

```
components/
├── ui/            # Component thuần UI, KHÔNG biết gì về nghiệp vụ:
│                  #   Button, Icon, Badge, Container, FormField,
│                  #   PlaceholderImage, SectionHeading, StateNotice,
│                  #   SocialIconLink
├── layout/        # Header, Footer, FloatingActionButton, UtmTracker —
│                  #   dùng ở root layout, xuất hiện trên MỌI trang
├── home/           # "Sections" của trang chủ — mỗi file = 1 khối nội dung
│                  #   trên trang chủ: Hero, TrustBar, WhyVetjoySection,
│                  #   ProblemSection, CareFramework,
│                  #   ProductCategoriesSection, ExpertSection,
│                  #   AppTeaserSection, TestimonialsSection,
│                  #   KnowledgePreviewSection, FinalCta
│                  #   → đây chính là phần đóng vai trò "sections/" trong
│                  #   các yêu cầu tài liệu, chỉ khác tên thư mục.
├── products/      # ProductCard, ProductFilters — dùng trong trang Sản phẩm
├── knowledge/     # ArticleCard, KnowledgeFilters — dùng trong Kiến thức
├── solutions/     # SolutionCard — dùng trong trang Giải pháp
├── forms/         # UtmHiddenFields — input ẩn dùng chung trong 3 form
├── analytics/     # TrackView, TrackedLink — bọc quanh phần tử cần gửi event
└── seo/           # JsonLd — render structured data
```

## `src/features/` — logic nghiệp vụ có side-effect

```
features/
├── consultation/
│   ├── ConsultationForm.tsx   # Client Component — render form, gọi Server Action
│   ├── actions.ts             # "use server" — validate Zod + gọi LeadRepository
│   └── state.ts               # Type ConsultationActionState + initial state
│                               # (tách khỏi actions.ts vì file "use server" ở
│                               #  Next.js 16 CHỈ được export async function)
├── dealer/        # Cấu trúc y hệt consultation/, cho form đại lý
└── contact/        # Cấu trúc y hệt consultation/, cho form liên hệ
```

## `src/services/` — lớp truy cập dữ liệu

```
services/
├── lead-repository.ts         # interface LeadRepository (hợp đồng)
├── demo-lead-repository.ts    # implementation demo — lưu mảng trong bộ nhớ
├── get-lead-repository.ts     # factory — nơi DUY NHẤT quyết định dùng repo nào
├── product-service.ts         # đọc/tìm/lọc sản phẩm
├── article-service.ts         # đọc/tìm/lọc bài viết
└── solution-service.ts        # đọc giải pháp theo slug
```

## `src/data/` — dữ liệu mẫu

`products.ts`, `articles.ts`, `solutions.ts`, `testimonials.ts`,
`product-categories.ts`, `article-categories.ts`. Mọi bản ghi có
`isDemo: true` (Product/Article/Testimonial) — xem
[`06_CONTENT_GUIDE.md`](./06_CONTENT_GUIDE.md) để biết chính xác nội dung
nào cần Founder thay.

## `src/lib/` — hàm thuần, không phụ thuộc React

```
lib/
├── analytics.ts        # track() — event abstraction, chưa gắn vendor thật
├── utm.ts               # đọc/lưu utm_* param
├── id.ts                 # generateId() cho lead
├── category-icons.ts    # map slug danh mục → tên icon (dùng chung nhiều nơi)
└── validation/           # Zod schema: consultation, dealer, contact, shared
```

## `src/types/` và `src/config/`

- `types/`: `Product`, `Article`, `Solution`, `Lead` (+ 3 biến thể theo
  loại lead), `Testimonial`, các type chung (`UtmParams`, `AnimalType`...).
- `config/site.ts`: **nguồn duy nhất** cho tên thương hiệu, slogan, thông
  tin liên hệ, danh sách nav, link mạng xã hội (đang để `null` cho tới khi
  có link thật). Không có nơi nào khác trong code hard-code các giá trị
  này — sửa ở đây là đủ.

## File test nằm cạnh file được test

Dự án **không** có thư mục `__tests__/` riêng — file test luôn nằm cạnh
file nó kiểm thử, đuôi `*.test.ts` (ví dụ
`src/lib/validation/consultation-schema.test.ts`,
`src/features/dealer/actions.test.ts`). `vitest.config.mts` quét theo
pattern `src/**/*.test.ts`.
