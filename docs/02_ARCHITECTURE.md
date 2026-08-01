# 02. Kiến trúc kỹ thuật

## Vì sao chọn Next.js (App Router)

Website cần SEO/SSR tốt vì kênh chính để có lead là tìm kiếm tự nhiên và
chia sẻ link (Zalo, Facebook). Next.js App Router được chọn vì:

- Mỗi route có thể tự khai báo `metadata`/`generateMetadata` riêng (SEO
  per-page — xem mục "SEO Strategy" bên dưới).
- Routing theo thư mục khớp tự nhiên với slug tiếng Việt đã chọn
  (`/giai-phap`, `/san-pham`, `/tu-van-bac-si`...).
- **Server Actions** cho phép xử lý 3 form thu lead (Tư vấn, Đại lý, Liên
  hệ) mà không cần dựng route API riêng — form submit thẳng vào một hàm
  server-side.
- Server Components mặc định giảm JS gửi xuống client, tốt cho hiệu suất
  trên các trang chủ yếu là nội dung tĩnh (Kiến thức, Sản phẩm, Giải pháp).

⚠️ **Lưu ý cho dev tiếp quản**: dự án dùng **Next.js 16**, không phải bản
13/14 phổ biến trong tài liệu/blog cũ. Khác biệt quan trọng nhất:
`params` và `searchParams` trong page/layout/route handler là **Promise**,
phải `await` trước khi dùng (xem bất kỳ file `page.tsx` nào có
`[slug]` để làm mẫu, ví dụ `src/app/san-pham/[slug]/page.tsx`).

## App Router — cách route được tổ chức

Toàn bộ route nằm trong `src/app/`. Quy ước:

- `page.tsx` = nội dung trang tại route đó.
- Thư mục `[slug]/` = dynamic route, dùng `generateStaticParams` để
  pre-render tất cả slug đã biết tại build time (SSG) — áp dụng cho
  `giai-phap/[slug]`, `san-pham/[slug]`, `kien-thuc/[slug]`.
- `san-pham/page.tsx` và `kien-thuc/page.tsx` đọc `searchParams` (category,
  q) nên được Next.js dựng là **route động** (server-rendered mỗi lần
  request) thay vì static.
- `sitemap.ts` và `robots.ts` là các route đặc biệt của Next.js, tự sinh
  `/sitemap.xml` và `/robots.txt`.
- `layout.tsx` (root) chứa Header, Footer, FloatingActionButton, UTM
  tracker và JSON-LD Organization — mọi trang đều thừa hưởng.

## Tailwind CSS v4

Tailwind v4 được cấu hình **không dùng file `tailwind.config.js`** — toàn
bộ token màu và font được khai báo trực tiếp trong
`src/app/globals.css` bằng khối `@theme inline`. Muốn đổi màu thương hiệu,
chỉ cần sửa các biến CSS trong `:root` của file này (xem
[`05_DESIGN_SYSTEM.md`](./05_DESIGN_SYSTEM.md)) — không có nơi nào khác
hard-code mã màu.

## Component structure

Dự án tách component theo 2 trục:

1. **Theo tầng dùng chung** (`src/components/ui/`): Button, Icon, Badge,
   Container, FormField, PlaceholderImage, SectionHeading, StateNotice,
   SocialIconLink — không biết gì về nghiệp vụ, chỉ nhận props.
2. **Theo tính năng/trang** (`src/components/home/`, `knowledge/`,
   `products/`, `solutions/`, `layout/`, `analytics/`, `seo/`) — mỗi
   component ứng với một section cụ thể trên một trang cụ thể.

Logic có tác dụng phụ (form, Server Action) được tách riêng vào
`src/features/{consultation,dealer,contact}/`, KHÔNG nằm trong
`components/` — xem [`04_COMPONENT_GUIDE.md`](./04_COMPONENT_GUIDE.md) và
[`03_FOLDER_STRUCTURE.md`](./03_FOLDER_STRUCTURE.md) để biết chi tiết từng
thư mục.

## Data flow

Có 2 luồng dữ liệu tách biệt hoàn toàn:

### 1. Luồng đọc (Read) — nội dung sản phẩm/bài viết/giải pháp

```
src/data/*.ts (dữ liệu mẫu, isDemo: true)
        ↓
src/services/{product,article,solution}-service.ts  (hàm async)
        ↓
Server Component (page.tsx) — await service function
        ↓
Component hiển thị (ProductCard, ArticleCard, SolutionCard...)
```

Các hàm trong `services/` đã là `async` dù hiện tại chỉ đọc mảng JS trong
bộ nhớ — mục đích là để sau này thay phần thân hàm bằng truy vấn Supabase
mà **không phải sửa bất kỳ page nào gọi tới nó**.

### 2. Luồng ghi (Write) — 3 form thu lead

```
ConsultationForm.tsx / DealerForm.tsx / ContactForm.tsx  (Client Component)
        ↓ (submit qua useActionState + <form action={...}>)
features/*/actions.ts  ("use server" — validate bằng Zod)
        ↓
services/get-lead-repository.ts → LeadRepository interface
        ↓
services/demo-lead-repository.ts  (lưu tạm trong mảng bộ nhớ, log console)
```

Khi validate lỗi, Server Action trả nguyên `values` người dùng đã nhập để
form hiển thị lại không mất dữ liệu (`state.values`), kèm `fieldErrors`
theo tên field. Xem thêm quy ước xử lý form trong
[`04_COMPONENT_GUIDE.md`](./04_COMPONENT_GUIDE.md#form-components).

## Responsive strategy

- **Mobile-first**: mọi class Tailwind viết mặc định cho mobile, breakpoint
  `sm:`/`lg:` chỉ thêm khi cần thay đổi cho màn hình lớn hơn.
- Container dùng class `.container-vj` (định nghĩa trong `globals.css`) —
  padding ngang tăng dần theo breakpoint, `max-width: 80rem`.
- Danh sách card luôn theo mẫu
  `grid gap-* sm:grid-cols-2 lg:grid-cols-3|4` để không bao giờ tràn dòng
  trên màn hình nhỏ.
- Timeline VETJOY CARE 5 có **2 layout khác nhau**: dọc (có đường nối bên
  trái) cho mobile/tablet, ngang (đường nối phía trên) cho `lg:` trở lên —
  xem `src/components/home/CareFramework.tsx`.
- Menu di động (Header) và Floating Action Button đều đã kiểm tra không
  đè lên nhau ở màn hình 375px (xem `08_QA_CHECKLIST.md`).

## SEO strategy

- Mỗi route quan trọng có `export const metadata` hoặc `generateMetadata`
  riêng (title, description, `alternates.canonical`).
- `src/app/layout.tsx` khai báo `metadataBase`, template title
  (`%s | VETJOY`), Open Graph mặc định.
- `src/app/sitemap.ts` tự sinh sitemap từ chính dữ liệu sản phẩm/bài
  viết/giải pháp hiện có (không hard-code danh sách URL).
- `src/app/robots.ts` trỏ tới sitemap.
- JSON-LD: `Organization` ở layout gốc, `BlogPosting` ở từng trang bài viết
  (`src/components/seo/JsonLd.tsx`). **Cố ý không** gắn structured data
  `Product` vì dữ liệu sản phẩm hiện là dữ liệu mẫu chưa xác minh — tránh
  đưa thông tin sản phẩm giả vào kết quả tìm kiếm Google.
- Slug dùng tiếng Việt không dấu, dễ đọc (`/tu-van-bac-si`, `/giai-phap`)
  theo đúng yêu cầu IA gốc của dự án.

## Testing strategy

Vitest + jsdom, không cần trình duyệt thật để chạy CI. Test tập trung vào
logic quan trọng nhất về mặt kinh doanh — validation Zod, Server Action
(giữ dữ liệu khi lỗi, tạo lead khi hợp lệ), UTM capture, product/article
filtering, cấu hình navigation — thay vì test lại chi tiết giao diện
(giao diện đã được kiểm tra thủ công qua trình duyệt thật, xem
[`08_QA_CHECKLIST.md`](./08_QA_CHECKLIST.md)).
