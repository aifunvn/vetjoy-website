# 13. Kế hoạch Row Level Security (RLS)

> **Sprint 1 Revision** — cập nhật theo quyết định Founder: multi-tenant
> bằng `organizations` (không phải `dealer_id`) đổi cách MỌI policy trong
> tài liệu này hoạt động — mỗi policy giờ có **2 lớp lọc** thay vì 1 (xem
> "Nguyên tắc chung #0" bên dưới). Đã thêm RLS cho `organizations`,
> `events` và 4 bảng AI mới.

> Đây là **kế hoạch chính sách**, không phải SQL policy thật. Không có
> `CREATE POLICY` nào trong tài liệu này — mục đích là thống nhất **ai
> được đọc/ghi gì** trước khi backend engineer viết policy thật ở Sprint
> viết migration. Tham chiếu bảng ở
> [`12_SUPABASE_SCHEMA.md`](./12_SUPABASE_SCHEMA.md).

## Mô hình vai trò (map với bảng `roles`)

| Vai trò (`roles.code`) | Mô tả | Phạm vi dữ liệu điển hình |
| --- | --- | --- |
| `super_admin` | Founder/kỹ thuật cấp cao vận hành **toàn nền tảng** | **Duy nhất** vai trò được vượt qua lớp lọc `organization_id` — xuyên suốt mọi `organizations` |
| `admin` | Quản lý vận hành **trong 1 `organization`** | Toàn quyền mọi bảng trong tổ chức của mình, trừ `audit_logs` (chỉ đọc) |
| `doctor` | Bác sĩ thú y | Dữ liệu y tế của bệnh nhân được giao, trong tổ chức của mình |
| `employee` | Nhân viên (kho, kinh doanh, CSKH) | Theo `permissions` được cấp qua `role_permissions`, trong tổ chức của mình |
| `dealer_owner` | Chủ/đại diện đại lý — **thuộc về 1 `organization`, không phải tenant riêng** | Dữ liệu khách hàng + đơn hàng thuộc `dealer_id` của mình, trong tổ chức của mình |
| `customer` | Khách hàng có tài khoản | Chỉ dữ liệu gắn với chính `customers.user_id` của mình, trong tổ chức của mình |
| `ai_system` | Tiến trình AI chạy nền (service) | Đọc dữ liệu đã cho phép trong phạm vi tổ chức để trả lời, ghi vào `ai_conversations`/`ai_feedback`/`ai_memory`/`ai_recommendations` |
| *(ẩn danh / anon)* | Khách chưa đăng nhập trên website | Chỉ bảng danh mục công khai (không có khái niệm tổ chức — xem Nhóm A) |

Một `users` có thể giữ nhiều vai trò cùng lúc qua `user_roles` (ví dụ vừa
`employee` vừa `doctor`) — RLS policy thật cần cộng gộp quyền theo
**vai trò rộng nhất** người dùng đang có, không phải chỉ vai trò đầu
tiên. Mỗi `users` (trừ `super_admin`) thuộc về đúng **một**
`organization_id` cố định (cột chuẩn trên bảng `users`).

## Nguyên tắc chung

### 0. Cách ly theo tổ chức (Organization isolation) — **nguyên tắc bao trùm mới, Sprint 1 Revision**

Mọi policy ở các "Nhóm" bên dưới (B, C, D, E, F) đều phải thoả **đồng
thời 2 điều kiện**, không phải 1:

1. **Điều kiện vai trò/sở hữu** (như mô tả trong từng nhóm — ví dụ
   "chính chủ", "bác sĩ được phân công"...).
2. **Điều kiện tổ chức**: `organization_id` của bản ghi = `organization_id`
   của `users` đang thực hiện request — **trừ `super_admin`**.

Nói cách khác: `organization_id` không phải là một cách phân loại thêm,
mà là **lớp lọc đầu tiên, áp dụng trước mọi điều kiện khác**. Một bác sĩ
của Tổ chức A **không bao giờ** thấy được bệnh nhân của Tổ chức B, dù
role/permission có giống hệt nhau.

Bảng không có `organization_id` (`provinces`, `species`, `roles`...) —
xem Nhóm A — không áp dụng lớp lọc này vì là dữ liệu dùng chung.

### 1. Mặc định khoá (deny-by-default)

Mọi bảng `enable row level security` ngay khi tạo, **không có policy nào
cho `anon`** trừ khi liệt kê tường minh ở Nhóm A. Khớp với cách `leads`
đã làm ở Phase 1 (`supabase/migrations/0001_init.sql`).

### 2. Service role bỏ qua RLS

Dùng cho Server Action/job nền (sinh `reminders`, `notifications`, ghi
`audit_logs`/`events`). Không được dùng service role key ở client — quy
tắc bảo mật xuyên suốt dự án từ Phase 1.

### 3. Bảng polymorphic — thách thức RLS lớn nhất

`attachments`, `notes`, `activities`, `events`, `reminders`, `ai_memory`,
`ai_recommendations` dùng `owner_table`/`owner_id` (hoặc
`subject_table`/`subject_id`) — Postgres RLS không tự kiểm tra được
"user có quyền trên bảng cha hay không" chỉ bằng policy đơn giản. Hướng
xử lý được chọn (không đổi so với Sprint 1 gốc, vẫn cần nhấn mạnh vì số
bảng polymorphic đã tăng từ 3 lên 7):

- Viết policy dạng `EXISTS` tra cứu chéo theo từng `owner_table` được
  whitelist, **luôn kèm điều kiện `organization_id` khớp** (nguyên tắc #0).
- **Whitelist `owner_table` bằng CHECK constraint** ở tầng migration
  thật.
- Đây là điểm phức tạp nhất của toàn bộ RLS plan — cần backend engineer
  review kỹ trước khi viết policy thật.

### 4. Dữ liệu y tế luôn chặt hơn dữ liệu thương mại

`treatments`, `prescriptions`, `vaccinations` — rủi ro cao nhất nếu RLS
sai (lộ hồ sơ sức khỏe của khách hàng khác, **hoặc của tổ chức khác**).

### 5. AI không tự nâng quyền chính mình

Vai trò `ai_system` được phép `INSERT` vào `ai_memory`/`ai_recommendations`/
`ai_training_data`, nhưng **không bao giờ** được tự đặt các cờ xác minh
(`is_verified`, chuyển `status` sang `accepted`/`applied`) — chỉ user
thật (`doctor`/`admin`/`employee` có quyền tương ứng) mới được đổi các cờ
này. Đây là ranh giới quan trọng cần giữ đúng khi viết policy thật, ánh
xạ trực tiếp nguyên tắc "AI không tự bịa dữ liệu y tế/xác nhận thông tin"
đã có xuyên suốt dự án từ Phase 1.

## Nhóm A — Đọc công khai (kể cả `anon`, không cần đăng nhập, không lọc theo tổ chức)

Phục vụ đúng những gì website hiện tại (Phase 1) cần: trang Sản phẩm,
Giải pháp, form địa chỉ. Các bảng này **không có `organization_id`** nên
không áp dụng nguyên tắc #0.

| Bảng | Policy |
| --- | --- |
| `product_categories` | `SELECT` toàn bộ |
| `provinces`, `districts`, `communes` | `SELECT` toàn bộ |
| `species`, `breeds` | `SELECT` toàn bộ |
| `ai_prompt_templates` (`organization_id is null`) | `SELECT` cho `ai_system`, **không public** |

**Ngoại lệ có `organization_id` nhưng vẫn đọc công khai** (lọc theo tổ
chức nhưng không cần đăng nhập — ví dụ website của mỗi tổ chức hiển thị
đúng sản phẩm/bác sĩ của tổ chức đó):

| Bảng | Policy |
| --- | --- |
| `products` | `SELECT` where `is_active = true` **và** `organization_id` = tổ chức đang được xem (website cần biết đang phục vụ tổ chức nào — xem ghi chú triển khai ở cuối file) |
| `doctors` | `SELECT` các cột public only (tên, chuyên môn, bio, avatar), lọc theo `organization_id`; **không** lộ `license_no` cho anon — cần **view riêng** (`doctors_public`), ngoài phạm vi Sprint 1 |

Toàn bộ nhóm này: **không có policy `INSERT`/`UPDATE`/`DELETE` cho
anon**.

## Nhóm B — Chính chủ (khách hàng chỉ thấy dữ liệu của mình, trong tổ chức của mình)

| Bảng | Điều kiện |
| --- | --- |
| `customers` | `user_id = auth.uid()` **và** cùng `organization_id` |
| `farms`, `animals` | `customer_id` thuộc về customer có `user_id = auth.uid()`, cùng `organization_id` |
| `sales_orders`, `invoices` | `customer_id` thuộc về customer của mình, cùng `organization_id` |
| `appointments`, `treatments`, `prescriptions`, `vaccinations` | `animal_id` (bắt buộc từ Sprint 1 Revision — xem `12_SUPABASE_SCHEMA.md`) thuộc về customer của mình, cùng `organization_id` — **SELECT only** |
| `ai_conversations`, `ai_feedback` | `customer_id` thuộc về customer của mình, cùng `organization_id` |
| `ai_memory` (khi `subject_table = 'customers'` hoặc `'animals'` thuộc về mình) | **Chỉ `SELECT` các bản ghi `is_verified = true`** — khách hàng không nên thấy "trí nhớ AI" chưa được xác minh về chính mình/vật nuôi của mình để tránh hiểu nhầm là thông tin y tế chính thức |
| `notifications` | `recipient_customer_id` = customer của mình |
| `reminders` | `customer_id` = customer của mình — `SELECT` + `UPDATE status` |

## Nhóm C — Nội bộ theo phân công (doctor/employee, trong tổ chức của mình)

| Bảng | Điều kiện |
| --- | --- |
| `appointments`, `treatments`, `prescriptions`, `vaccinations` | Bác sĩ: `doctor_id = <doctor hiện tại>`, cùng `organization_id`; nhân viên: theo `permissions` |
| `inventory`, `suppliers`, `purchase_orders` | `employee`/`admin` có quyền `inventory.write`, cùng `organization_id` |
| `products`, `product_categories` | `employee`/`admin` có quyền `products.write` mới được sửa `products` (lọc `organization_id`); `product_categories` đọc chung, sửa chỉ `super_admin` (dùng chung toàn nền tảng) |
| `notes` | Tác giả (`author_id = auth.uid()`) hoặc `admin` cùng tổ chức; khách hàng **không bao giờ** đọc được |
| `activities`, `events` | Đọc: nhân viên/bác sĩ/admin liên quan tới `subject_id`, cùng tổ chức; ghi: **chỉ qua service role** |
| `ai_recommendations` | Nhân viên/bác sĩ/admin có quyền trên `subject_id` mới xem/duyệt (`status`), cùng tổ chức — xem nguyên tắc #5 |
| `ai_training_data` | Chỉ user có quyền `ai.manage_training_data`, cùng tổ chức (hoặc `organization_id is null` nếu là tập dữ liệu dùng chung toàn nền tảng — cần `super_admin`) |

## Nhóm D — Đại lý (`dealer_owner`, trong tổ chức của mình)

| Bảng | Điều kiện |
| --- | --- |
| `dealers` | Chỉ sửa được chính bản ghi của mình (`user_id = auth.uid()`), cùng `organization_id` |
| `customers` | `SELECT` các customer có `dealer_id` = đại lý của mình, cùng `organization_id` — không sửa hồ sơ y tế |
| `sales_orders` | `dealer_id` = đại lý của mình, cùng `organization_id` — `SELECT` + `INSERT` |

Đại lý **không bao giờ** truy cập trực tiếp `treatments`/`prescriptions`
— ranh giới này **độc lập** với việc `dealer_id` không còn là ranh giới
tenant (2 việc khác nhau: một cái là phạm vi dữ liệu thương mại, một cái
là phạm vi bảo mật y tế).

## Nhóm E — Chỉ admin/super_admin

| Bảng | Lý do |
| --- | --- |
| `organizations` | Chỉ `super_admin` tạo/sửa; thành viên tổ chức chỉ `SELECT` đúng tổ chức mình |
| `roles`, `permissions`, `role_permissions`, `user_roles` | Cấu hình phân quyền cấp hệ thống — dùng chung, chỉ `super_admin` sửa |
| `settings` (`scope = 'global'`, `organization_id is null`) | Cấu hình toàn nền tảng — chỉ `super_admin` |
| `settings` (`scope = 'organization'`) | Chỉ `admin`/`super_admin` của đúng tổ chức đó |
| `audit_logs` | Chỉ đọc (theo `organization_id` của mình, `super_admin` xem toàn bộ), **không ai được ghi trực tiếp** |
| `invoices` (ghi/sửa) | Chỉ `admin`/nhân viên có quyền `finance.write`, cùng tổ chức |
| `ai_prompt_templates` (ghi/sửa) | Chỉ `super_admin` (template dùng chung) hoặc `admin` của tổ chức nếu `organization_id` khác null (tuỳ biến riêng) |

## Nhóm F — Hệ thống (service role / `ai_system`)

| Bảng | Vai trò của service |
| --- | --- |
| `reminders`, `notifications` | Job nền quét `vaccinations.next_due_at`, `appointments.scheduled_at`... |
| `events` | **Mọi** ghi vào bảng này đi qua service role/trigger — không client nào tự chèn event |
| `ai_conversations`, `ai_conversation_messages` | Ghi log hội thoại real-time |
| `ai_memory`, `ai_recommendations` | `ai_system` `INSERT` được, nhưng **không tự set** `is_verified`/`status = 'accepted'` (xem nguyên tắc #5) |
| `audit_logs` | Trigger tự động ghi khi có `UPDATE`/`DELETE` trên bảng nhạy cảm |

## Bảng tổng hợp mức độ nhạy cảm (ưu tiên review khi viết policy thật)

| Mức độ | Bảng |
| --- | --- |
| 🔴 Rất nhạy cảm (dữ liệu y tế + tài chính) | `treatments`, `prescriptions`, `invoices`, `audit_logs` |
| 🟠 Nhạy cảm (thông tin cá nhân) | `customers`, `users`, `appointments`, `vaccinations`, `ai_conversations`, `ai_memory` |
| 🟡 Nội bộ vận hành | `inventory`, `purchase_orders`, `sales_orders`, `notes`, `activities`, `events`, `dealers`, `ai_recommendations`, `ai_training_data` |
| 🟢 Công khai/danh mục | `products`, `product_categories`, `provinces`, `districts`, `communes`, `species`, `breeds` |
| 🔵 Hạ tầng tenant (mới) | `organizations` — không "nhạy cảm" theo nghĩa dữ liệu cá nhân, nhưng sai policy ở đây ảnh hưởng **toàn bộ** cách ly dữ liệu của hệ thống, cần review kỹ ngang mức 🔴 |

## Ghi chú triển khai: website public cần biết "đang phục vụ tổ chức nào"

Khác với Phase 1 (chỉ có 1 công ty, không cần phân biệt), khi website
phục vụ nhiều `organizations`, request ẩn danh (anon) tới trang Sản
phẩm/Giải pháp cần một cách xác định `organization_id` mục tiêu **trước
khi** query chạy — ví dụ qua subdomain, custom domain, hoặc tham số cấu
hình cố định nếu VETJOY chỉ có 1 tổ chức đang hoạt động công khai. Đây là
quyết định **kiến trúc ứng dụng** (không phải RLS thuần) cần chốt trước
khi triển khai Nhóm A cho các bảng có `organization_id` — ghi nhận là
việc cần làm ở Sprint viết migration, chưa giải quyết ở Sprint 1.

## Việc CẦN làm khi viết migration thật (không thực hiện ở Sprint 1)

1. Bật `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` cho mọi bảng ngay khi
   tạo.
2. Viết hàm helper Postgres: `auth.current_organization_id()` (mới, quan
   trọng nhất — mọi policy khác đều gọi lại hàm này),
   `auth.current_customer_id()`, `auth.has_permission(code)`.
3. Viết test RLS riêng — kiểm thử **thêm cả tình huống chéo tổ chức**
   (user Tổ chức A cố truy vấn dữ liệu Tổ chức B phải luôn thất bại),
   không chỉ test chéo vai trò như Sprint 1 gốc.
4. Review đặc biệt kỹ nhóm bảng polymorphic (nguyên tắc #3) — nay có 7
   bảng thay vì 3, rủi ro tăng theo số lượng.
5. Quyết định cơ chế xác định `organization_id` cho request ẩn danh (mục
   "Ghi chú triển khai" ở trên) trước khi mở Nhóm A cho bảng có
   `organization_id`.

## File liên quan

- Danh sách bảng & field: [`12_SUPABASE_SCHEMA.md`](./12_SUPABASE_SCHEMA.md)
- Kế hoạch Storage (áp dụng RLS tương tự cho file): [`14_STORAGE_PLAN.md`](./14_STORAGE_PLAN.md)
- Nguyên tắc multi-tenant: [`11_DATABASE_ARCHITECTURE.md`](./11_DATABASE_ARCHITECTURE.md)
