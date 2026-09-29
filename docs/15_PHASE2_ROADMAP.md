# 15. Phase 2 Roadmap — Kỹ thuật (Database-first)

> **Sprint 1 Revision** — cập nhật theo quyết định Founder: thêm Giai
> đoạn 0 (multi-tenant `organizations` — bắt buộc làm trước tiên), thêm
> `events`/`ai_prompt_templates` vào giai đoạn sớm, thêm 3 bảng AI mới
> vào Giai đoạn 7, cập nhật bảng rủi ro.

> Tài liệu này là **roadmap triển khai kỹ thuật**, cụ thể hoá phần "Phase
> 2.1 Supabase" đã phác thảo ở
> [`09_PHASE2_PLAN.md`](./09_PHASE2_PLAN.md) thành các bước dựa trên 40
> bảng đã thiết kế ở [`12_SUPABASE_SCHEMA.md`](./12_SUPABASE_SCHEMA.md).
> Việc chia Sprint cụ thể (ai làm gì, khi nào) nằm ở
> [`BACKLOG_PHASE2.md`](./BACKLOG_PHASE2.md) — file này chỉ mô tả **thứ tự
> phụ thuộc kỹ thuật hợp lý**, không phải cam kết lịch trình.

## Nguyên tắc trình tự

Database có phụ thuộc chặt (bảng con cần bảng cha tồn tại trước), nên thứ
tự triển khai không thể tuỳ ý. **Sprint 1 Revision thêm một ràng buộc mới
lên trên tất cả**: vì mọi bảng nghiệp vụ đều có `organization_id not
null`, **không bảng nào khác có thể tạo trước `organizations`** — đây là
thay đổi quan trọng nhất so với roadmap Sprint 1 gốc.

## Giai đoạn 0 — Multi-tenant foundation (MỚI, bắt buộc đầu tiên)

- `organizations` — tạo bảng + **seed ít nhất 1 bản ghi** (tổ chức mặc
  định đại diện cho chính VETJOY/Công ty Thú y Chung Lương)
- RLS Nhóm E cho `organizations` (chỉ `super_admin` tạo/sửa)

**Điều kiện hoàn thành**: có đúng 1 `organization_id` mặc định tồn tại để
mọi migration ở Giai đoạn 1 trở đi tham chiếu tới khi seed dữ liệu ban
đầu. **Không giai đoạn nào khác được bắt đầu trước khi giai đoạn này
hoàn thành.**

## Giai đoạn 1 — Nền tảng danh mục (không phụ thuộc bảng nghiệp vụ)

Có thể triển khai độc lập, không rủi ro, không phụ thuộc dữ liệu người
dùng thật. Các bảng dùng chung (không có `organization_id`) và
`ai_prompt_templates` (có nhưng nullable, có thể seed template mặc định
dùng chung ngay từ đầu):

- `provinces`, `districts`, `communes` (cần nguồn dữ liệu hành chính xác
  thực trước khi seed — xem ghi chú ở `12_SUPABASE_SCHEMA.md`)
- `species`, `breeds`
- `roles`, `permissions` (+ `user_roles`, `role_permissions`)
- `product_categories`
- `ai_prompt_templates` (**mới** — thêm sớm vì không phụ thuộc bảng
  nghiệp vụ nào khác, chỉ cần `organizations` đã tồn tại từ Giai đoạn 0
  nếu muốn seed template riêng cho tổ chức mặc định; template dùng chung
  toàn nền tảng để `organization_id = null`)

**Điều kiện hoàn thành**: seed đủ dữ liệu tra cứu, RLS Nhóm A hoạt động
đúng.

## Giai đoạn 2 — Định danh & Thực thể trung tâm & `events`

- `users` (map với Supabase Auth, **bắt buộc gắn `organization_id`** —
  cần quyết định trước: dùng Supabase Auth trực tiếp hay hệ thống đăng
  nhập riêng rồi đồng bộ sang `users`)
- `doctors`, `employees`, `dealers`
- `customers` — **điểm tích hợp quan trọng nhất**: đây là lúc
  `DemoLeadRepository` (Phase 1) được thay bằng luồng thật
  (`leads` → duyệt thủ công/tự động → tạo `customers` với đúng
  `organization_id`). Không sửa `LeadRepository` interface, chỉ thêm
  implementation mới theo đúng seam đã chuẩn bị từ Phase 1.
- `farms`, `animals` — **animal-centric**: đảm bảo pipeline tạo
  `customers` mới luôn kèm khả năng tạo `animals` ngay (kể cả bản ghi
  "chưa xác định" tạm thời) vì Giai đoạn 5 sẽ yêu cầu `appointments`/
  `treatments` bắt buộc có `animal_id`.
- `events` (**mới**) — tạo cấu trúc bảng sớm, dù việc "phát sự kiện" đầy
  đủ chỉ hoàn thiện dần qua các giai đoạn sau (mỗi giai đoạn tự thêm
  logic emit event cho bảng mới của mình). Tạo sớm để không phải hồi tố
  event cho dữ liệu Giai đoạn 2 sau này.

**Điều kiện hoàn thành**: một lead từ website có thể được chuyển thành
`customers` + `animals`/`farms` mà không mất dữ liệu UTM/nguồn gốc
(`source_lead_id`, `source_utm`), đúng `organization_id`, và sinh được ít
nhất 1 dòng `events` (`customer.created`) làm phép thử cơ chế.

## Giai đoạn 3 — Danh mục sản phẩm & Kho

- `products` — migrate dữ liệu từ `src/data/products.ts` **vào đúng
  `organization_id` mặc định** (Giai đoạn 0), giữ nguyên cờ `is_demo`.
- `suppliers`, `inventory`
- `purchase_orders` (+ `purchase_order_items`)

**Điều kiện hoàn thành**: trang `/san-pham` trên website có thể chuyển từ
đọc `src/data/products.ts` sang đọc Supabase mà không đổi UI (đúng seam
`product-service.ts` đã chuẩn bị từ Phase 1) — cần giải quyết trước "ghi
chú triển khai" ở `13_RLS_POLICY_PLAN.md` (website public xác định đang
phục vụ `organization_id` nào).

## Giai đoạn 4 — Thương mại

- `sales_orders` (+ `sales_order_items`)
- `invoices`

**Điều kiện hoàn thành**: một `customers` có thể có lịch sử đơn hàng —
**chưa cần** cổng thanh toán online.

## Giai đoạn 5 — Y tế & Chăm sóc (VETJOY CARE 5, Animal-centric)

Giai đoạn **rủi ro cao nhất** về mặt RLS (xem
[`13_RLS_POLICY_PLAN.md`](./13_RLS_POLICY_PLAN.md) nhóm 🔴), nay càng
quan trọng hơn vì `animals` là trung tâm:

- `appointments` — **`animal_id` bắt buộc ngay từ migration đầu tiên**,
  không tạo cột nullable rồi ép buộc sau (tránh dữ liệu rác không có
  animal_id).
- `treatments`
- `prescriptions` (+ `prescription_items`)
- `vaccinations`
- `reminders` (cần job nền/cron — hạ tầng job nền chưa có, cần chọn giải
  pháp: Supabase Edge Function theo lịch, hay job server riêng)

**Điều kiện hoàn thành**: một bác sĩ có thể ghi nhận đủ chu trình
Ghi nhận → Đánh giá → Giải pháp → Theo dõi cho một `animal` cụ thể (không
có đường nào bỏ qua `animal_id`), RLS đã được test riêng cho cả 2 chiều:
chéo vai trò (`customer` không thấy hồ sơ người khác) **và** chéo tổ
chức (`doctor` Tổ chức A không thấy bệnh nhân Tổ chức B).

## Giai đoạn 6 — CRM tổng quát & Nền tảng

- `attachments`, `notes`, `activities` (cần hoàn thiện
  [`14_STORAGE_PLAN.md`](./14_STORAGE_PLAN.md) trước `attachments`,
  gồm cả path convention có `organization_id`)
- `activities` giờ nên được sinh từ `events` (đã tạo từ Giai đoạn 2) qua
  trigger/job lọc — không tự ghi độc lập như thiết kế Sprint 1 gốc.
- `notifications`, `settings`
- `audit_logs` (nên bật **cùng lúc** với Giai đoạn 5, không để sau)

**Điều kiện hoàn thành**: mọi thay đổi trên bảng 🔴 rất nhạy cảm đều có
dòng tương ứng trong `audit_logs`; `activities` hiển thị đúng dòng thời
gian được lọc từ `events`.

## Giai đoạn 7 — AI (mở rộng — 3 bảng mới)

- `ai_conversations` (+ `ai_conversation_messages`)
- `ai_feedback`
- `ai_memory` (**mới**) — phụ thuộc `ai_conversations` đã tồn tại
- `ai_recommendations` (**mới**) — phụ thuộc `ai_conversations`
- `ai_training_data` (**mới**) — phụ thuộc `ai_conversations`, cần quy
  trình xác minh thủ công trước khi dùng (xem `12_SUPABASE_SCHEMA.md`)

**Điều kiện hoàn thành**: hạ tầng dữ liệu sẵn sàng để cắm AI Assistant
thật (chọn LLM provider là quyết định kinh doanh riêng, xem
`09_PHASE2_PLAN.md` mục 2.4) — **không** nghĩa là AI đã hoạt động, chỉ là
nơi lưu trữ đã có sẵn. Đặc biệt xác nhận: `ai_recommendations` luôn khởi
tạo ở `status = 'pending_review'`, không có đường nào để AI tự chuyển
sang `applied`.

## Rủi ro kỹ thuật xuyên suốt (không riêng giai đoạn nào)

| Rủi ro | Ảnh hưởng | Đề xuất giảm thiểu |
| --- | --- | --- |
| RLS sai trên bảng polymorphic (nay 7 bảng: `attachments`/`notes`/`activities`/`events`/`reminders`/`ai_memory`/`ai_recommendations`) | Lộ dữ liệu chéo giữa khách hàng hoặc **chéo tổ chức** | Viết test RLS riêng theo từng `owner_table` **và** theo từng `organization_id` trước khi bật cho người dùng thật |
| Chưa chọn giải pháp job nền (cron/scheduler) cho `reminders`/`events`→`activities` | Nhắc lịch không tự sinh, dòng thời gian CRM trống | Quyết định sớm ở Giai đoạn 5–6: Supabase Edge Functions + `pg_cron`, hay job server riêng |
| Website public chưa có cơ chế xác định `organization_id` đang phục vụ | Không thể mở Nhóm A RLS cho `products`/`doctors` đúng cách | Chốt cơ chế (subdomain/custom domain/cấu hình cố định) trước Giai đoạn 3 |
| Nguồn dữ liệu hành chính VN (`provinces/districts/communes`) chưa xác nhận | Seed sai/thiếu dữ liệu địa chỉ | Xác nhận nguồn trước Giai đoạn 1 |
| `medical-records`/`business-documents` chưa có giải pháp quét virus/malware | Rủi ro bảo mật khi cho phép upload file | Chọn giải pháp trước khi mở upload công khai |
| `ai_memory`/`ai_recommendations` bị dùng sai (coi đề xuất/trí nhớ chưa xác minh là sự thật y tế) | Sai lệch thông tin y tế cho khách hàng | Bắt buộc `is_verified`/`status = 'pending_review'` ở tầng dữ liệu (đã thiết kế), **không** cho phép UI hiển thị nội dung chưa xác minh như thể đã xác minh |
| Đã chốt Hướng A (`organizations`) — không còn là rủi ro mở, nhưng retrofit sai cột `organization_id` ở bất kỳ bảng nào cũng là lỗi nghiêm trọng | Dữ liệu tổ chức này lộ sang tổ chức khác | Review checklist "mọi bảng phải có `organization_id not null` trừ ngoại lệ đã liệt kê" trước khi merge mỗi migration |

## Không nằm trong roadmap này

Theo đúng phạm vi được giao: **không** thiết kế API layer, **không**
thiết kế màn hình quản trị (admin UI) cho từng bảng, **không** thiết kế
luồng CI/CD migration.

## File liên quan

- Kế hoạch kinh doanh tổng quan Phase 2: [`09_PHASE2_PLAN.md`](./09_PHASE2_PLAN.md)
- Chi tiết 40 bảng: [`12_SUPABASE_SCHEMA.md`](./12_SUPABASE_SCHEMA.md)
- Backlog theo Sprint: [`BACKLOG_PHASE2.md`](./BACKLOG_PHASE2.md)
