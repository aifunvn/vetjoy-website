# 06. Hướng dẫn nội dung — Placeholder vs Nội dung thật

Tài liệu này liệt kê **chính xác** những gì trong code hiện là dữ liệu
mẫu/placeholder, ở đâu, và Founder cần cung cấp gì để thay thế. Không có
mục nào trong danh sách dưới đây là suy đoán — tất cả lấy trực tiếp từ
source code hiện tại.

## Cách nhận biết nội dung mẫu trong code

| Cơ chế | Ý nghĩa | Ví dụ |
| --- | --- | --- |
| `isDemo: true` trên object dữ liệu | Bản ghi Product/Article/Testimonial là dữ liệu mẫu | `src/data/products.ts` |
| `<DemoDataBadge />` trong UI | Hiển thị nhãn "DỮ LIỆU MẪU" cho người dùng thấy | Trang chi tiết sản phẩm, bài viết, testimonial |
| Comment `// PLACEHOLDER` trong code | Giá trị cấu hình cần Founder xác nhận | `src/config/site.ts` |
| Text `PLACEHOLDER — ...` hiển thị thẳng trên UI | Vùng chưa có nội dung thật | `ExpertSection`, trang Chính sách/Điều khoản |
| `PlaceholderImage` (icon + gradient) | Chưa có ảnh/video thật | Toàn bộ ảnh trên site |

## 1. Logo & thương hiệu

- Hiện **chưa có file logo** trong `public/` — tên thương hiệu "VETJOY"
  đang hiển thị dạng chữ (text) trong `Header.tsx`/`Footer.tsx`, không
  phải ảnh logo.
- **Cần cung cấp**: file logo (SVG ưu tiên, có bản nền trong suốt), để dev
  thay phần text bằng `<Image>` trong Header/Footer.

## 2. Ảnh & video

Toàn bộ ảnh trên site hiện là `PlaceholderImage` (icon + nền gradient +
nhãn "Hình ảnh minh họa") — không có ảnh chụp thật nào được dùng. Danh
sách vị trí cần ảnh thật:

| Vị trí | File | Icon minh hoạ hiện tại |
| --- | --- | --- |
| Hero trang chủ | `components/home/Hero.tsx` | bác sĩ thú y (`stethoscope`) |
| Đội ngũ chuyên môn | `components/home/ExpertSection.tsx` | bác sĩ thú y |
| Từng sản phẩm | `components/products/ProductCard.tsx`, `app/san-pham/[slug]/page.tsx` | theo danh mục (thuốc, vaccine, thức ăn...) |
| Từng bài viết kiến thức | `components/knowledge/ArticleCard.tsx` | theo chuyên mục bài viết |
| VETJOY App | `app/vetjoy-app/page.tsx` | icon app (mockup điện thoại vẽ bằng CSS, không phải ảnh chụp màn hình thật) |
| Bản đồ trụ sở | `components/layout/Footer.tsx` | icon ghim bản đồ (chờ địa chỉ thật để nhúng Google Maps thật) |

Chưa có video nào được nhúng ở Phase 1/1.5.

## 3. Thông tin liên hệ (`src/config/site.ts`)

| Trường | Giá trị hiện tại (placeholder) | Cần Founder cung cấp |
| --- | --- | --- |
| `contact.phoneDisplay` / `phoneHref` | `"1900 xxxx (placeholder)"` / `tel:1900000000` | Số hotline thật |
| `contact.zaloHref` | `https://zalo.me/0000000000` | Link Zalo OA thật |
| `contact.email` | `lienhe@vetjoy.example.com` | Email liên hệ thật |
| `contact.addressPlaceholder` | `"PLACEHOLDER: Địa chỉ trụ sở Công ty Thú y Chung Lương"` | Địa chỉ trụ sở đầy đủ |
| `contact.workingHoursPlaceholder` | `"PLACEHOLDER: Thứ 2 – Thứ 7, 8:00 – 17:30"` | Giờ làm việc chính xác |
| `url` | `https://vetjoy.example.com` | Domain chính thức |

## 4. Mạng xã hội (`siteConfig.social`)

Hiện **cả 5 giá trị đều là `null`** (Facebook, YouTube, TikTok, Zalo,
Messenger) — Footer và Floating Action Button tự động hiển thị các icon
này ở trạng thái vô hiệu hoá (`aria-disabled`, không phải link thật) cho
tới khi có giá trị thật. **Không tự tạo link** — chỉ cần điền URL thật
vào `src/config/site.ts`, UI tự bật link mà không cần sửa Footer/FAB.

## 5. Thông tin bác sĩ / đội ngũ chuyên môn

`components/home/ExpertSection.tsx` hiện hiển thị 4 mục, **toàn bộ đang
là placeholder**, đúng nguyên văn trong code:

- Tên bác sĩ: `PLACEHOLDER — chờ Founder cung cấp`
- Bằng cấp / chứng chỉ: `PLACEHOLDER — chờ Founder cung cấp`
- Thành tích: `PLACEHOLDER — chờ Founder cung cấp`
- Số khách hàng đã hỗ trợ: `PLACEHOLDER — chờ Founder cung cấp`

Câu văn giới thiệu "hơn 20 năm kinh nghiệm thú y" là **thông tin định vị
thương hiệu đã có trong brief gốc của dự án**, không phải số liệu tự suy
đoán — nhưng tên, bằng cấp, chứng chỉ, thành tích cụ thể vẫn cần Founder
xác nhận trước khi công bố.

## 6. Khách hàng & đánh giá (testimonial)

`src/data/testimonials.ts` — 3 bản ghi, tất cả có `isDemo: true`, tên tác
giả đều có tiền tố `[Mẫu]` (ví dụ `"[Mẫu] Anh Nguyễn Văn A"`), nội dung
đánh giá là câu minh hoạ vị trí hiển thị, **không phải đánh giá thật**.
UI hiển thị badge
`"DỮ LIỆU MẪU – CẦN THAY BẰNG DỮ LIỆU ĐÃ XÁC MINH"` phía trên các card
này (`TestimonialsSection.tsx`). Trước khi lên production: thay bằng
đánh giá thật đã được khách hàng đồng ý công khai.

## 7. Sản phẩm

`src/data/products.ts` — 7 sản phẩm mẫu (mỗi danh mục 1 sản phẩm), tên có
tiền tố `[Mẫu]`. Các trường `usage`, `composition`, `instructions`,
`packaging`, `manufacturer`, `notes` đều là chuỗi cảnh báo cố định:

> "DỮ LIỆU MẪU — thông tin chi tiết (thành phần, liều dùng, chỉ định) sẽ
> được VETJOY cập nhật sau khi xác minh chuyên môn."

**Tuyệt đối không được điền thành phần/liều dùng/chỉ định thật vào đây
nếu chưa qua xác minh chuyên môn của bác sĩ thú y VETJOY** — đây là yêu
cầu bắt buộc từ brief gốc của dự án (rủi ro pháp lý/an toàn nếu sai).

## 8. Bài viết kiến thức

`src/data/articles.ts` — 4 bài mẫu, tiêu đề có tiền tố `[Mẫu]`, nội dung
(`content` array) là 2 đoạn văn cố định giải thích đây là nội dung minh
hoạ bố cục, không phải nội dung chuyên môn thật.

## 9. Pháp lý

- `/chinh-sach-bao-mat` và `/dieu-khoan-su-dung`: cả hai trang đều có
  khối "PLACEHOLDER — CẦN FOUNDER PHÊ DUYỆT" — nội dung pháp lý chi tiết
  chưa được soạn thảo, cần bộ phận pháp lý/Founder duyệt trước khi công
  bố chính thức.
- Footer: dòng "PLACEHOLDER: Thông tin đăng ký kinh doanh cần Founder xác
  nhận" ở copyright — cần điền mã số thuế/giấy phép kinh doanh nếu muốn
  hiển thị.

## Checklist trước khi go-live (tổng hợp)

- [ ] Logo thật (SVG/PNG nền trong suốt)
- [ ] Ảnh thật: bác sĩ, trang trại, sản phẩm (7 sản phẩm mẫu hiện có),
      hoạt động tư vấn
- [ ] Số điện thoại, Zalo OA, email thật
- [ ] Địa chỉ trụ sở + giờ làm việc chính xác
- [ ] Link Facebook/YouTube/TikTok/Zalo OA/Messenger thật (nếu có)
- [ ] Thông tin bác sĩ: tên, bằng cấp, chứng chỉ, thành tích
- [ ] Đánh giá khách hàng thật (đã xin phép công khai)
- [ ] Dữ liệu sản phẩm thật đã qua xác minh chuyên môn (thành phần, liều
      dùng, chỉ định/chống chỉ định, hạn dùng)
- [ ] Nội dung bài viết chuyên môn thật (do bác sĩ thú y VETJOY biên soạn)
- [ ] Nội dung Chính sách bảo mật & Điều khoản sử dụng đã qua pháp lý
- [ ] Domain chính thức
