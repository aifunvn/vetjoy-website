# 08. QA Checklist

Checklist này dùng để kiểm thử thủ công mỗi khi có thay đổi đáng kể về
giao diện hoặc trước mỗi lần deploy. Các mục đánh dấu **(đã xác nhận)**
là kết quả kiểm thử thật đã thực hiện qua trình duyệt trong Phase 1/1.5 —
vẫn nên chạy lại sau mỗi thay đổi lớn vì hành vi có thể đổi theo code.

## Desktop (≥1280px)

- [ ] Không có horizontal scroll ở bất kỳ trang nào **(đã xác nhận: trang
      chủ, 1280px, `scrollWidth === clientWidth`)**
- [ ] Header hiển thị đầy đủ menu + CTA "Nhận tư vấn"
- [ ] VETJOY CARE 5 hiển thị dạng timeline ngang có đường nối
- [ ] Floating Action Button không che nội dung/CTA khác ở góc dưới-phải

## Tablet (~768px)

- [ ] Card sản phẩm/bài viết/giải pháp chuyển từ 1 cột sang lưới 2 cột
      đúng breakpoint `sm:`
- [ ] Form Tư vấn/Đại lý/Liên hệ không bị vỡ layout ở độ rộng trung bình

## Mobile (375px)

- [ ] Không có horizontal scroll **(đã xác nhận: trang chủ, 375px)**
- [ ] Menu mobile (hamburger) mở/đóng đúng, `aria-expanded` đổi theo
      trạng thái **(đã xác nhận)**
- [ ] CTA header ẩn đúng (`sm:inline-flex`), không chiếm chỗ trên mobile
- [ ] Floating Action Button không đè lên nút menu mobile **(đã xác nhận
      qua bounding rect: FAB nằm trong viewport, không chồng lấn Header)**
- [ ] VETJOY CARE 5 chuyển sang timeline dọc có đường nối bên trái
- [ ] Text không tràn khỏi card ở bất kỳ đâu (Hero, Why VETJOY, Problem,
      Product, Knowledge)

## Navigation

- [ ] Toàn bộ 7 mục menu chính hoạt động: Trang chủ, Giải pháp, Sản phẩm,
      Tư vấn bác sĩ, Kiến thức, VETJOY App, Về VETJOY
- [ ] Footer: Dành cho đại lý, Liên hệ, Chính sách bảo mật, Điều khoản sử
      dụng đều dẫn đúng trang
- [ ] Breadcrumb/back: link "Xem giải pháp/chi tiết/đọc tiếp" trên mọi
      card đều dẫn đúng slug

### 5 flow bắt buộc (theo brief gốc — đã xác nhận hoạt động ở Phase 1)

- [ ] Flow 1: Trang chủ → hiểu VETJOY → Nhận tư vấn
- [ ] Flow 2: Vấn đề → Giải pháp → Tư vấn bác sĩ → Submit lead **(đã xác
      nhận: submit thành công, lead ghi log server)**
- [ ] Flow 3: Sản phẩm → Product Detail → Nhận tư vấn
- [ ] Flow 4: Đại lý → Form đối tác → Submit lead **(đã xác nhận)**
- [ ] Flow 5: Kiến thức → Article → CTA → Tư vấn

## 404 / not-found

- [ ] Truy cập slug không tồn tại (`/san-pham/khong-ton-tai`,
      `/giai-phap/khong-ton-tai`, `/kien-thuc/khong-ton-tai`) trả về
      trang not-found của Next.js (do gọi `notFound()` trong từng
      `page.tsx`), không phải lỗi 500

## Form (Tư vấn bác sĩ / Đại lý / Liên hệ)

- [ ] Submit thiếu trường bắt buộc → hiển thị lỗi tiếng Việt rõ ràng,
      **không mất dữ liệu đã nhập ở các trường khác** **(đã xác nhận cho
      cả 3 form, bao gồm cả trường `<select>` và checkbox consent — xem
      ghi chú kỹ thuật trong `04_COMPONENT_GUIDE.md` về pattern `key`)**
- [ ] Submit hợp lệ → hiển thị `StateNotice` thành công, nút chuyển sang
      trạng thái "Đang gửi..." trong lúc chờ (chống submit lặp)
- [ ] Checkbox "Tôi đồng ý..." bắt buộc phải tick mới submit được
- [ ] UTM (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`,
      `utm_term`) được ghi nhận vào lead khi URL có tham số tương ứng

## SEO

- [ ] Mỗi trang có `<title>` và meta description riêng, không trùng
- [ ] `/sitemap.xml` liệt kê đủ route tĩnh + toàn bộ slug sản
      phẩm/bài viết/giải pháp hiện có
- [ ] `/robots.txt` trỏ đúng tới sitemap
- [ ] JSON-LD `Organization` xuất hiện ở mọi trang (view-source, tìm
      `application/ld+json`)
- [ ] JSON-LD `BlogPosting` xuất hiện ở trang chi tiết bài viết

## Accessibility

- [ ] Mọi phần tử tương tác mới thêm đều có class `.focus-ring` và hiện
      outline khi Tab bằng bàn phím
- [ ] Ảnh minh hoạ/icon trang trí có `aria-hidden="true"` nếu không mang
      thông tin
- [ ] Icon mạng xã hội/Messenger chưa có link thật render bằng
      `aria-disabled`, không lọt vào tab order **(đã xác nhận)**
- [ ] Input form có `<label>` liên kết đúng qua `htmlFor`/`id`
- [ ] Contrast chữ chính trên nền chính đạt tối thiểu AA (4.5:1) — riêng
      icon/badge ở trạng thái "chưa cập nhật" được miễn trừ vì là UI
      disabled có chủ đích

## Performance

- [ ] Không thêm dependency mới không cần thiết — kiểm tra `package.json`
      trước khi merge
- [ ] Ảnh khi thay placeholder bằng ảnh thật phải dùng `next/image`
      (không dùng thẻ `<img>` thô) để tận dụng lazy-load + responsive
      image tự động
- [ ] `npm run build` không có cảnh báo bundle size bất thường
