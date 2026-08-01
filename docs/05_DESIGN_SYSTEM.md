# 05. Design System

Nguồn sự thật duy nhất cho toàn bộ token: **`src/app/globals.css`**. Tài
liệu này chỉ diễn giải lại các token đang tồn tại — không thêm token mới
nào ngoài những gì đã có trong code.

## Màu sắc (Colors)

Khai báo dưới dạng CSS variable trong `:root`, expose ra Tailwind qua khối
`@theme inline` (nên dùng được trực tiếp làm class, ví dụ
`bg-brand-green-600`, `text-brand-teal-700`).

| Nhóm | Thang | Dùng cho |
| --- | --- | --- |
| `brand-green-50 → 900` | 10 bậc | Màu chủ đạo — nút chính, tiêu đề nhấn, nền tối (CareFramework dùng `900`) |
| `brand-teal-50 → 700` | 8 bậc | Màu phụ/công nghệ — link, badge chuyên mục, focus ring |
| `neutral-0 → 900` | 11 bậc | Nền, viền, text — `neutral-0` = trắng tuyệt đối |
| `accent-amber-100/500/700` | 3 bậc | Riêng cho `DemoDataBadge` (cảnh báo dữ liệu mẫu) |
| `danger-50/500/700` | 3 bậc | Lỗi form (`StateNotice tone="error"`) |
| `success-50/500/700` | 3 bậc | Thành công (`StateNotice tone="success"`) |

**Quy tắc**: không hard-code mã hex trong component. Muốn đổi màu thương
hiệu, chỉ sửa các biến trong `:root` — toàn bộ site đổi theo.

## Typography

- Font: **Be Vietnam Pro** (Google Font, subset `latin` + `vietnamese`),
  nạp qua `next/font/google` trong `layout.tsx`, expose qua biến
  `--font-be-vietnam` → `font-sans`. Không dùng font khác.
- Thang chữ đang dùng (không phải token riêng, chỉ là class Tailwind mặc
  định được áp dụng nhất quán theo quy ước sau):
  - H1 (trang chủ Hero): `text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-[1.15] tracking-tight`
  - H1 (trang con): `text-2xl sm:text-3xl font-bold`
  - H2 (`SectionHeading`): `text-2xl sm:text-3xl font-bold tracking-tight`
  - Eyebrow (nhãn nhỏ trên H2): `text-sm font-semibold uppercase tracking-wide text-brand-teal-600`
  - Body: `text-base` (quan trọng) / `text-sm` (phụ), `leading-relaxed` cho đoạn dài
  - Caption/meta: `text-xs text-neutral-400` hoặc `text-neutral-500`

## Spacing

- **Container**: class `.container-vj` — `max-width: 80rem`, padding ngang
  tăng dần `1rem → 1.5rem (sm) → 2rem (lg)`.
- **Khoảng cách giữa các section trên trang chủ**: class `.section-py` —
  `py-16` (mobile) → `py-20` (sm) → `py-24` (lg). **Mọi section mới thêm
  vào trang chủ nên dùng class này** để giữ nhịp điệu đồng nhất, thay vì
  tự chọn số `py-*` khác.
- **Khoảng cách trong grid card**: `gap-4` (card nhỏ, nhiều cột) đến
  `gap-6` (card lớn, ít cột hơn) tuỳ mật độ.

## Border radius

Dùng thang mặc định của Tailwind, quy ước theo cấp độ phần tử:

| Phần tử | Radius |
| --- | --- |
| Card (`.card-vj`) | `1rem` (`rounded-2xl` tương đương) |
| Button, input, select | `rounded-lg` (0.5rem) |
| Icon tile (`.icon-tile`) | `rounded-xl` (0.75rem) |
| Badge, pill, avatar tròn | `rounded-full` |
| Ảnh minh hoạ (`PlaceholderImage`) | `rounded-2xl` |

## Shadow

- `.card-vj` mặc định có shadow rất nhẹ
  (`0 1px 2px rgba(13,47,34,.04)`) — gần như phẳng khi không hover.
- `.card-vj-hover:hover` nâng lên `translateY(-3px)` kèm shadow rõ hơn
  (`0 12px 24px -12px rgba(13,47,34,.18)`) — dùng `card-vj card-vj-hover`
  cùng lúc cho mọi card có thể click (product, article, solution, problem,
  why-vetjoy).
- Nút primary/secondary: `shadow-sm` lúc thường, `hover:shadow-md` +
  `hover:-translate-y-0.5` lúc hover (xem `Button.tsx`).
- Nút outline/ghost: **không** có shadow/lift — giữ phân cấp thị giác thấp
  hơn nút primary/secondary.

## Animation & hover

- Nguyên tắc: **animation nhẹ, có mục đích**, tôn trọng
  `prefers-reduced-motion`.
- `.animate-fade-up` (định nghĩa trong khối
  `@media (prefers-reduced-motion: no-preference)`) — fade + trượt lên
  12px trong 500ms, dùng cho Hero (`animation-delay` lệch nhau giữa cột
  trái/phải để tạo cảm giác tuần tự).
- Hover chuẩn cho card: đổi màu viền (`hover:border-brand-*-300`) + nâng
  nhẹ qua `.card-vj-hover`.
- Hover chuẩn cho link dạng "Xem thêm": icon mũi tên (`arrow-right`)
  dịch sang phải `group-hover:translate-x-0.5`.
- Không dùng animation lặp vô hạn, không dùng parallax, không dùng
  video nền — đúng nguyên tắc "không lạm dụng animation" của dự án.

## Button

Xem chi tiết props ở [`04_COMPONENT_GUIDE.md`](./04_COMPONENT_GUIDE.md).
4 biến thể: `primary` (nền xanh lá đậm), `secondary` (nền teal), `outline`
(viền xanh lá, chữ xanh lá), `ghost` (không nền, chỉ đổi màu khi hover).
2 kích thước: `md`, `lg`. CTA quan trọng nhất trên mỗi trang luôn dùng
`primary` + `size="lg"`.

## Card

Class chuẩn: `card-vj card-vj-hover` cho card có thể click/hover;
`card-vj` (không kèm `-hover`) cho card tĩnh không tương tác (ví dụ khối
thông tin bác sĩ trong `ExpertSection`). Card có ảnh minh hoạ ở đầu dùng
thêm `overflow-hidden p-0` trên chính `<Link>`, để `PlaceholderImage`
tràn sát viền trên và bị bo góc theo card cha.

## Icon

Xem `ui/Icon.tsx` — 1 bộ icon dùng chung, viewBox `24x24`, `strokeWidth:
1.75`. Icon luôn đặt trong `.icon-tile` (khối nền vuông bo góc) khi cần
nhấn mạnh, hoặc đứng trần khi dùng inline cạnh text (badge, trust point,
"Đọc tiếp"). Kích thước icon dùng đúng thang chuẩn Tailwind
(`h-3.5 w-3.5`, `h-4 w-4`, `h-5 w-5`, `h-6 w-6`, `h-8 w-8`) —
**tránh** các giá trị không tồn tại trong thang mặc định như `h-4.5`
(không sinh ra CSS, icon sẽ mất kích thước).

## Responsive

- Breakpoint dùng: mặc định (mobile) → `sm:` (≥640px) → `lg:` (≥1024px).
  Hầu như không dùng `md:` riêng (site chỉ có 2 điểm gãy chính, tối giản
  số breakpoint để dễ bảo trì).
- Đã kiểm tra thực tế không có horizontal scroll ở 375px và 1280px (xem
  [`08_QA_CHECKLIST.md`](./08_QA_CHECKLIST.md)).
- Các phần tử trang trí (blur glow ở Hero/FinalCta) đặt trong section có
  `overflow-hidden` để không gây tràn ngang dù bounding box vượt viewport.

## Accessibility đi kèm design system

- Mọi phần tử tương tác dùng class `.focus-ring` (outline 2px màu
  `brand-teal-500`, chỉ hiện khi `:focus-visible`).
- Phần tử chưa có link thật (social icon, Messenger trong FAB) render
  bằng `<span aria-disabled="true">` kèm `title` — không lọt vào tab
  order, không đánh lừa người dùng rằng đó là link hoạt động.
