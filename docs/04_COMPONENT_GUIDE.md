# 04. Hướng dẫn Component

Quy ước chung: mọi component dưới đây nhận props qua TypeScript interface
inline (không dùng `PropTypes`), không có state ẩn ngoài những component
được đánh dấu **Client Component**. Component không đánh dấu là
**Server Component** mặc định của Next.js App Router.

---

## Nhóm UI dùng chung (`src/components/ui/`)

### `Button` / `LinkButton` — `Button.tsx`

**Mục đích**: nút bấm chuẩn hoá toàn site — 4 biến thể màu, 2 kích thước.

| Prop | Kiểu | Ghi chú |
| --- | --- | --- |
| `variant` | `"primary" \| "secondary" \| "outline" \| "ghost"` | mặc định `"primary"` |
| `size` | `"md" \| "lg"` | mặc định `"md"` |
| `className` | `string` | nối thêm, không override |
| còn lại | `ButtonHTMLAttributes` (Button) hoặc `{ href }` (LinkButton) | |

**Cách mở rộng**: thêm biến thể mới → thêm key vào `Variant` type và
`variantClasses`. Không tạo component nút mới ở nơi khác — mọi nút trên
site nên đi qua đây để giữ transition/shadow/focus-ring đồng bộ.

### `Icon` — `Icon.tsx`

**Mục đích**: bộ icon tự viết tay (không dùng thư viện ngoài), toàn bộ
24×24, `stroke="currentColor"`, `strokeWidth={1.75}` — để icon luôn đồng
bộ phong cách dù dùng ở đâu.

| Prop | Kiểu | Ghi chú |
| --- | --- | --- |
| `name` | `IconName` (union string, xem đầu file) | bắt buộc |
| `className` | `string` | mặc định `"h-6 w-6"`, luôn set `h-* w-*` theo bội số chuẩn của Tailwind (không dùng `h-4.5` — không tồn tại trong thang Tailwind) |
| còn lại | `SVGAttributes<SVGSVGElement>` | |

**Cách mở rộng**: thêm icon mới → (1) thêm tên vào union type `IconName`,
(2) thêm case trong hàm `paths()`. Giữ nguyên viewBox `0 0 24 24` và
stroke-grammar hiện có để icon mới không bị lệch tông với icon cũ.

### `PlaceholderImage` — `PlaceholderImage.tsx`

**Mục đích**: thay thế cho ảnh thật (bác sĩ, trang trại, sản phẩm...) chưa
có. Cố tình thiết kế như minh hoạ (icon + gradient + nhãn "Hình ảnh minh
họa") để **không bao giờ bị hiểu nhầm là ảnh thật**.

| Prop | Kiểu | Mặc định |
| --- | --- | --- |
| `label` | `string` | bắt buộc — mô tả ảnh sẽ là gì |
| `icon` | `IconName` | `"paw"` |
| `aspect` | `string` (class Tailwind aspect-ratio) | `"aspect-[4/3]"` |
| `className` | `string` | `""` |

**Cách mở rộng khi có ảnh thật**: thay `<Icon .../>` bằng `next/image`
ngay trong component này (một chỗ duy nhất) — tất cả nơi gọi
`PlaceholderImage` (Hero, ExpertSection, ProductCard, ArticleCard, Footer
map, vetjoy-app...) sẽ tự động nhận ảnh thật nếu bạn thêm logic "nếu có
ảnh thật thì render `<Image>`, không thì render minh hoạ" tại đây. Không
sửa từng nơi gọi.

### `SectionHeading` — `SectionHeading.tsx`

Tiêu đề section chuẩn hoá: `eyebrow` (nhãn nhỏ phía trên) + `title` (h2) +
`description` tuỳ chọn. Prop `align`: `"center"` (mặc định) hoặc `"left"`.

### `Badge` / `DemoDataBadge` — `Badge.tsx`

`Badge` là badge tròn chung (`tone`: `neutral | green | amber`).
`DemoDataBadge` là badge **bắt buộc** phải gắn cạnh mọi nội dung mẫu —
prop `verified` (mặc định `false`) đổi text sang bản dài
"DỮ LIỆU MẪU – CẦN THAY BẰNG DỮ LIỆU ĐÃ XÁC MINH" (dùng cho testimonial).
**Không xoá badge này** khỏi bất kỳ nơi nào đang hiển thị dữ liệu mẫu.

### `StateNotice` — `StateNotice.tsx`

Hộp thông báo trạng thái form/trang: `tone`: `"success" | "error" | "empty"`.
Tự set `role="alert"` khi lỗi, `role="status"` khi còn lại — giữ nguyên để
không phá accessibility của 3 form.

### `FormField.tsx` — `TextField`, `TextAreaField`, `SelectField`, `CheckboxField`

**Mục đích**: input có label, hint, error message thống nhất cho cả 3 form.

⚠️ **Quan trọng khi sửa `SelectField`/`CheckboxField`**: React 19 tự động
gọi `form.reset()` (native) mỗi khi một Server Action được dispatch từ
`<form action={...}>` — hành vi này xoá `<select>`/`<input type="checkbox">`
về giá trị mount ban đầu **bất kể** action thành công hay lỗi. Cách khắc
phục đã áp dụng trong `ConsultationForm`/`DealerForm`/`ContactForm`: thêm
`key={values.<field> ?? "unset"}` để component **remount** với
`defaultValue`/`defaultChecked` mới mỗi khi Server Action trả về giá trị
khác. Nếu thêm field `<select>`/checkbox mới vào form, **phải** áp dụng
lại pattern `key` này, nếu không giá trị người dùng chọn sẽ biến mất sau
khi submit lỗi. Chi tiết kỹ thuật xem `docs/10_CHANGELOG.md` (Phase 1,
mục sửa lỗi).

### `Container` — layout width chuẩn (`.container-vj`), `SocialIconLink` —
icon mạng xã hội tự ẩn/disable khi chưa có link thật (`href: string | null`).

---

## Nhóm layout (`src/components/layout/`)

### `Header.tsx` (Client Component)

Menu desktop + menu mobile (toggle qua `useState`), CTA "Nhận tư vấn" nổi
bật. Dữ liệu nav đọc từ `config/site.ts` (`primaryNav`, `headerCta`) —
**sửa nav ở đó**, không sửa mảng trong Header.

### `Footer.tsx`

Điều hướng, liên hệ, social icon (qua `SocialIconLink`, đọc từ
`siteConfig.social`), khối bản đồ placeholder (`PlaceholderImage`
`icon="map-pin"`), giờ làm việc placeholder.

### `FloatingActionButton.tsx` (Client Component)

Nút nổi góc dưới-phải, mở ra 4 hành động nhanh: Nhận tư vấn (link nội bộ),
Gọi điện (`tel:`), Chat Zalo (external), Messenger (đang là placeholder vì
`siteConfig.social.messenger` = `null`).

**Cách mở rộng**: sửa mảng `actions` trong file này. Mỗi action có
`href: string | null` — để `null` thì tự động render dạng vô hiệu hoá
(`aria-disabled`, không phải link thật) thay vì trỏ tới URL giả.

### `UtmTracker.tsx` (Client Component)

Không render gì (`return null`) — chỉ có tác dụng phụ: đọc `utm_*` từ URL
mỗi lần điều hướng và lưu vào `localStorage` (qua `lib/utm.ts`). Đặt trong
`<Suspense>` ở root layout vì dùng hook `useSearchParams`.

---

## Nhóm trang chủ (`src/components/home/`)

### `Hero.tsx`

Headline 2 dòng + 4 "trust point" có icon (`experience`, `stethoscope`,
`chat`, `heartbeat`) + 2 CTA + `PlaceholderImage` kèm badge nổi "20+ năm".
Không nhận props — nội dung hard-code trong file vì đây là bản duy nhất
(không tái sử dụng ở trang khác). Muốn đổi headline/CTA, sửa trực tiếp.

### `TrustBar.tsx`

4 item tĩnh (icon + value + label), lấy từ mảng `items` trong file. **Chỉ
sửa text/icon nếu có số liệu đã xác minh** — không thêm số liệu chưa được
Founder xác nhận (xem `06_CONTENT_GUIDE.md`).

### `WhyVetjoySection.tsx`

6 card lý do chọn VETJOY (`reasons` array: icon + title + desc). Thêm/bớt
card → sửa mảng này, layout tự chia `sm:grid-cols-2 lg:grid-cols-3`.

### `ProblemSection.tsx`

8 card "Bạn đang gặp vấn đề gì", mỗi card có `icon` + `label` + `href` trỏ
tới trang Giải pháp hoặc `/dai-ly`. Thêm vấn đề mới → thêm phần tử vào
mảng `problems`.

### `CareFramework.tsx`

Hiển thị khung **VETJOY CARE 5**. Có **2 layout riêng**: `hidden lg:grid`
(ngang, có đường nối phía trên các icon) và `lg:hidden` (dọc, đường nối
bên trái) — cả hai đọc chung mảng `steps`. Sửa số bước/nội dung → sửa
mảng `steps`, nhưng nếu thêm/bớt SỐ LƯỢNG bước cần kiểm tra lại
`lg:grid-cols-5` (đang hard-code = số bước).

### `ProductCategoriesSection.tsx`

Card danh mục sản phẩm trên trang chủ, dùng chung map icon
`productCategoryIcons` từ `lib/category-icons.ts` với `ProductCard`. Nhận
prop `categories: ProductCategory[]` (đọc qua `product-service.ts`).

### `ExpertSection.tsx`

Giới thiệu đội ngũ chuyên môn — 100% placeholder (`credentials` array chỉ
có icon + label, giá trị luôn là "PLACEHOLDER — chờ Founder cung cấp").
**Không tự điền tên/bằng cấp/thành tích** vào đây.

### `AppTeaserSection.tsx`

Giới thiệu VETJOY App, có `PhoneMockup` (component nội bộ, dựng bằng CSS
thuần — border bo tròn giả khung điện thoại) thay vì ảnh chụp màn hình
thật. `screenFeatures` array điều khiển 3 dòng tính năng hiển thị trong
khung.

### `TestimonialsSection.tsx`

Nhận prop `testimonials: Testimonial[]`. Có badge
`<DemoDataBadge verified />` bắt buộc phải giữ cho tới khi có đánh giá
khách hàng thật.

### `KnowledgePreviewSection.tsx`

Nhận prop `articles: Article[]` (trang chủ chỉ truyền 3 bài mới nhất —
xem `src/app/page.tsx`), render bằng component dùng chung `ArticleCard`.

### `FinalCta.tsx`

CTA cuối trang chủ, nền có hiệu ứng blur/pattern trang trí
(`aria-hidden="true"`, không ảnh hưởng nội dung đọc bằng screen reader).

---

## Nhóm sản phẩm/kiến thức/giải pháp

### `ProductCard.tsx`, `ArticleCard.tsx`, `SolutionCard.tsx`

Cả 3 dùng chung style `card-vj card-vj-hover` (xem
[`05_DESIGN_SYSTEM.md`](./05_DESIGN_SYSTEM.md)) và map icon từ
`src/lib/category-icons.ts` (`productCategoryIcons`, `articleCategoryIcons`,
`solutionIcons`). **Khi thêm danh mục sản phẩm/bài viết/giải pháp mới**,
phải thêm icon tương ứng vào 3 map này (TypeScript sẽ báo lỗi nếu quên,
vì các map được định kiểu `Record<Slug, IconName>` — không thể thiếu key).

### `ProductFilters.tsx`, `KnowledgeFilters.tsx` (Client Component)

Ô tìm kiếm + dropdown danh mục, đồng bộ vào URL query (`?q=`, `?category=`)
qua `router.replace`, debounce 300ms cho ô tìm kiếm. Trang cha
(`san-pham/page.tsx`, `kien-thuc/page.tsx`) đọc `searchParams` để lọc dữ
liệu — filter component không tự lọc dữ liệu, chỉ đổi URL.

---

## Nhóm form (`src/features/*`)

`ConsultationForm.tsx`, `DealerForm.tsx`, `ContactForm.tsx` đều theo cùng
một khuôn: `useActionState(submitXAction, initialXState)` →
`<form action={formAction}>` → hiển thị `StateNotice` khi
`state.status === "success"`, hoặc render lại toàn bộ field với
`defaultValue={values.field}` + `error={errors.field}` khi
`state.status === "error"`. Xem cảnh báo về `key` trên `<select>`/checkbox
ở mục `FormField.tsx` phía trên trước khi thêm field mới.

---

## Quy tắc chung khi thêm component mới

1. Đặt đúng thư mục theo phạm vi (dùng chung → `ui/`; chỉ dùng ở trang chủ
   → `home/`; có side-effect/form → `features/`).
2. Không hard-code màu — dùng class Tailwind trỏ tới token trong
   `globals.css` (`brand-green-*`, `brand-teal-*`, `neutral-*`...).
3. Không thêm icon library — thêm icon mới vào `ui/Icon.tsx`.
4. Nội dung mẫu phải gắn `isDemo: true` (nếu là dữ liệu) hoặc
   `<DemoDataBadge />` (nếu là UI), hoặc ghi rõ "PLACEHOLDER" trong text.
