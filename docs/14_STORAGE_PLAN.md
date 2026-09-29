# 14. Kế hoạch Supabase Storage

> Kế hoạch thiết kế — chưa tạo bucket thật, chưa viết policy Storage
> thật. Mọi bản ghi trong bảng `attachments`
> (xem [`12_SUPABASE_SCHEMA.md`](./12_SUPABASE_SCHEMA.md)) trỏ tới file
> nằm trong các bucket được thiết kế dưới đây qua cột `file_path`.

## Vì sao tách nhiều bucket thay vì một bucket chung

Mức độ nhạy cảm của file rất khác nhau (ảnh sản phẩm công khai vs. ảnh hồ
sơ điều trị riêng tư) — Supabase Storage áp policy **theo từng bucket**,
nên tách bucket theo mức độ nhạy cảm giúp policy đơn giản và khó sai hơn
là một bucket + logic phân quyền phức tạp theo từng file.

## Danh sách bucket đề xuất

| Bucket | Public/Private | Nội dung | Bảng `owner_table` liên quan |
| --- | --- | --- | --- |
| `public-assets` | **Public** (đọc tự do qua URL) | Logo, ảnh trang trí UI dùng chung (khi thay `PlaceholderImage` bằng ảnh thật ở tầng site, không qua `attachments`) | Không qua bảng `attachments` — dùng trực tiếp trong code như hiện tại đang dùng `public/` của Next.js |
| `product-images` | **Public** | Ảnh sản phẩm | `products` |
| `profile-avatars` | **Public** | Avatar user/doctor/employee/dealer | `users`, `doctors` |
| `animal-photos` | **Private** (ký URL có thời hạn) | Ảnh vật nuôi (không mang thông tin y tế nhạy cảm nhưng vẫn là dữ liệu cá nhân của khách hàng) | `animals` |
| `medical-records` | **Private, nhạy cảm cao** | Ảnh vết thương, scan đơn thuốc, kết quả xét nghiệm | `treatments`, `prescriptions` |
| `business-documents` | **Private** | Giấy phép kinh doanh, hợp đồng đại lý | `dealers`, `suppliers` |
| `ai-uploads` | **Private, tạm thời** | Ảnh khách gửi cho AI Assistant để hỏi (ví dụ ảnh biểu hiện vật nuôi) trước khi được gắn chính thức vào `treatments` | `ai_conversations` |

`public-assets` **không** đi qua bảng `attachments` vì nó không thuộc sở
hữu của một bản ghi nghiệp vụ cụ thể (giống cách `public/` của Next.js
hoạt động ở Phase 1) — các bucket còn lại đều được `attachments` trỏ tới.

## Quy ước đặt tên đường dẫn (`file_path`)

> **Cập nhật Sprint 1 Revision**: thêm `<organization_id>` vào đầu đường
> dẫn — hệ quả trực tiếp của quyết định multi-tenant bằng `organizations`
> (xem `11_DATABASE_ARCHITECTURE.md`). Việc này cho phép policy Storage
> kiểm tra quyền theo tổ chức chỉ bằng cách so khớp prefix đường dẫn,
> nhất quán với cách mọi bảng khác lọc theo `organization_id`.

```
<bucket>/<organization_id>/<owner_table>/<owner_id>/<uuid>-<tên-file-gốc-đã-chuẩn-hoá>.<ext>
```

Ví dụ: `medical-records/9a1d.../treatments/2f6a.../8b1c...-vet-tham-kham-01.jpg`

- `<organization_id>` khớp đúng `attachments.organization_id` — Storage
  policy có thể kiểm tra "path bắt đầu bằng organization_id của user
  hiện tại" mà không cần join bảng `attachments` trong mọi trường hợp đơn
  giản (dù vẫn cần join khi kiểm tra quyền sở hữu chi tiết hơn theo
  `owner_table`/`owner_id`).
- `<owner_id>` khớp đúng `attachments.owner_id` — cho phép xoá toàn bộ
  file của một bản ghi bằng cách liệt kê theo prefix, không cần quét
  toàn bucket.
- `<uuid>` ngẫu nhiên để tránh trùng tên và tránh đoán được đường dẫn file
  người khác (an ninh qua việc không thể đoán tên, dù vẫn cần policy thật
  làm lớp bảo vệ chính — không dựa vào việc "khó đoán tên" làm cơ chế bảo
  mật duy nhất).

## Giới hạn & xác thực file (áp dụng ở tầng ứng dụng khi upload)

| Loại | Định dạng cho phép | Giới hạn dung lượng đề xuất |
| --- | --- | --- |
| Ảnh (product, avatar, animal, medical) | `jpg`, `jpeg`, `png`, `webp` | 5 MB/file |
| Tài liệu (business-documents) | `pdf`, `jpg`, `png` | 10 MB/file |
| Upload từ AI conversation | `jpg`, `jpeg`, `png` | 5 MB/file, tự xoá sau X ngày nếu không được gắn vào hồ sơ chính thức (xem mục Retention) |

Giới hạn cụ thể (số MB, số file/ngày...) cần Founder xác nhận theo chi
phí lưu trữ Supabase thực tế — số liệu trên là đề xuất kỹ thuật ban đầu,
không phải quyết định cuối cùng.

## Chính sách truy cập theo bucket (đề xuất, chưa viết policy thật)

| Bucket | Đọc | Ghi/Xoá |
| --- | --- | --- |
| `product-images`, `profile-avatars` | Công khai (anon đọc được qua URL trực tiếp) | Chỉ `employee`/`admin` có quyền tương ứng (`products.write`, hồ sơ cá nhân tự sửa avatar của mình) |
| `animal-photos` | Chủ khách hàng (`customers.user_id = auth.uid()`) + bác sĩ/nhân viên được phân công + admin, qua **signed URL có thời hạn ngắn** (không public) | Chủ khách hàng tự upload; bác sĩ/nhân viên upload khi thăm khám |
| `medical-records` | Chỉ bác sĩ phụ trách + khách hàng chủ vật nuôi + admin, qua signed URL thời hạn **ngắn hơn** `animal-photos` (ví dụ 15 phút thay vì 1 giờ) | Chỉ bác sĩ/nhân viên y tế được phân công |
| `business-documents` | Chính đại lý/nhà cung cấp liên quan + admin | Chính chủ tự upload khi đăng ký, admin duyệt |
| `ai-uploads` | Người tạo hội thoại + admin giám sát chất lượng AI | Hệ thống AI (service role) ghi khi nhận upload từ khách |

Nguyên tắc chọn "signed URL có thời hạn" thay vì bucket private + policy
phức tạp cho từng request: đơn giản hoá triển khai ở Sprint đầu, vẫn đảm
bảo file không lộ qua URL tĩnh vĩnh viễn.

## Retention (thời gian lưu trữ) — đề xuất, cần Founder xác nhận

- `medical-records`, `animal-photos`: **lưu vô thời hạn** cùng vòng đời
  của bản ghi liên quan (soft-delete theo `deleted_at` của bảng cha,
  không tự xoá file theo lịch) — phù hợp yêu cầu truy vết ngành thú y.
- `ai-uploads`: đề xuất **tự động xoá sau 30 ngày** nếu không được một
  nhân viên/bác sĩ "chốt" gắn vào `treatments`/`prescriptions` chính thức
  — tránh phình dung lượng lưu trữ với ảnh hỏi nhanh không có giá trị lâu
  dài. Con số 30 ngày là đề xuất, cần Founder duyệt.
- `business-documents`: lưu vô thời hạn (yêu cầu pháp lý/đối soát).

## Việc CẦN làm khi triển khai thật (ngoài phạm vi Sprint 1)

1. Tạo 7 bucket theo danh sách trên qua Supabase Dashboard/CLI (không
   phải migration SQL — Storage bucket là tài nguyên riêng của Supabase).
2. Viết Storage policy thật (tương đương RLS nhưng cú pháp Storage API)
   khớp bảng "Chính sách truy cập" ở trên.
3. Viết hàm tạo signed URL ở service layer (tương tự cách
   `src/services/get-lead-repository.ts` là nơi duy nhất quyết định
   repository nào đang dùng — nên có một `get-storage-service.ts` đóng
   vai trò tương tự cho toàn bộ thao tác Storage).
4. Cân nhắc virus/malware scanning cho `business-documents` và
   `medical-records` trước khi cho phép truy cập công khai qua signed URL
   — chưa có giải pháp cụ thể ở Sprint 1, ghi nhận là rủi ro cần xử lý
   trước go-live (xem báo cáo rủi ro cuối tài liệu roadmap).

## File liên quan

- Bảng `attachments`: [`12_SUPABASE_SCHEMA.md`](./12_SUPABASE_SCHEMA.md#cụm-8--crm-tổng-quát-polymorphic)
- RLS cho dữ liệu liên quan: [`13_RLS_POLICY_PLAN.md`](./13_RLS_POLICY_PLAN.md)
