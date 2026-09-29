# Backlog Phase 2

> **Sprint 1 Revision** — cập nhật theo quyết định Founder: thêm Sprint
> 1.5 (Giai đoạn 0 — `organizations`), quyết định multi-tenant đã
> **RESOLVED** (Hướng A), thêm `events`/`ai_prompt_templates` vào Sprint
> 2, thêm 3 bảng AI mới vào Sprint 7.

> Backlog kỹ thuật cho Phase 2, chia theo Sprint dựa trên thứ tự phụ
> thuộc đã phân tích ở [`15_PHASE2_ROADMAP.md`](./15_PHASE2_ROADMAP.md).
> Đây là **danh sách việc cần làm**, không phải cam kết ngày hoàn thành —
> không có ước lượng thời gian cụ thể (giờ/ngày). Độ phức tạp đánh dấu
> tương đối: **S** (nhỏ) / **M** (vừa) / **L** (lớn).

## Sprint 1 — Kiến trúc dữ liệu nền tảng ✅ Đã hoàn thành (PASS WITH CHANGES)

- [x] Thiết kế 34 bảng gốc + bảng phụ trợ cần thiết
- [x] ERD Mermaid theo cụm + tổng quan
- [x] Kế hoạch RLS theo vai trò
- [x] Kế hoạch Supabase Storage
- [x] Roadmap kỹ thuật theo giai đoạn phụ thuộc
- [x] Backlog này (bản gốc)

**Founder review**: PASS WITH CHANGES — xem Sprint 1 Revision bên dưới.

## Sprint 1 Revision — Cập nhật theo quyết định Founder ✅ Đã hoàn thành

- [x] Chốt multi-tenant bằng bảng `organizations` (không dùng `dealer_id`)
- [x] Chuyển toàn bộ tài liệu sang animal-centric (`animals` là trung tâm
      hồ sơ sức khỏe; `appointments`/`treatments` bắt buộc `animal_id`)
- [x] Thêm bảng `events` (timeline hệ thống)
- [x] Thêm 4 bảng AI: `ai_memory`, `ai_recommendations`,
      `ai_prompt_templates`, `ai_training_data`
- [x] Cập nhật ERD (11), Schema (12), RLS (13), Storage (14), Roadmap (15)
- [x] Cập nhật backlog này

**Quyết định Founder đã chốt (không còn là "chờ quyết định")**:
- [x] ~~Hướng multi-tenant~~ → **Đã chọn Hướng A (`organizations`)**

**Quyết định Founder vẫn cần chốt trước khi mở Sprint 1.5**:
- [ ] Xác nhận dùng Supabase Auth trực tiếp cho `users`, hay hệ thống
      đăng nhập khác rồi đồng bộ
- [ ] Nguồn dữ liệu hành chính VN chính thức cho `provinces/districts/communes`
- [ ] Ngân sách Supabase (tier trả phí nào, giới hạn Storage)
- [ ] **Mới**: cơ chế xác định `organization_id` cho request ẩn danh trên
      website public (subdomain/custom domain/cấu hình cố định — xem
      `13_RLS_POLICY_PLAN.md` mục "Ghi chú triển khai")
- [ ] **Mới**: mô hình `organizations` sẽ dùng cho gì trước — nhiều chi
      nhánh của VETJOY, hay nền tảng SaaS cho nhiều công ty thú y khác?
      (ảnh hưởng cách đặt tên/UX chọn tổ chức, không ảnh hưởng cấu trúc
      bảng vì đã thiết kế dùng chung được cho cả hai)

## Sprint 1.5 — Multi-tenant foundation (MỚI — bắt buộc trước Sprint 2)

Tương ứng Giai đoạn 0 của roadmap. **Chặn toàn bộ Sprint 2 trở đi** — vì
mọi bảng khác đều có `organization_id not null`.

- [ ] **[M]** Viết migration `organizations`
- [ ] **[S]** Seed 1 bản ghi tổ chức mặc định cho VETJOY/Công ty Thú y
      Chung Lương
- [ ] **[S]** RLS Nhóm E cho `organizations`
- [ ] **[S]** Viết hàm helper `auth.current_organization_id()` (dùng lại
      ở mọi Sprint sau)

## Sprint 2 — Danh mục nền tảng + Định danh + Thực thể trung tâm + `events`

Tương ứng Giai đoạn 1 + 2 của roadmap.

- [ ] **[L]** Viết migration thật cho: `roles`, `permissions`,
      `user_roles`, `role_permissions`
- [ ] **[M]** Viết migration + seed `provinces`, `districts`, `communes`
- [ ] **[S]** Viết migration + seed `species`, `breeds`
- [ ] **[S]** **[Mới]** Viết migration `ai_prompt_templates`, seed vài
      template mặc định dùng chung nền tảng
- [ ] **[L]** Viết migration `users` (kèm `organization_id`) + quyết định
      cách đồng bộ với Supabase Auth
- [ ] **[M]** Viết migration `doctors`, `employees`, `dealers`
- [ ] **[L]** Viết migration `customers` + service chuyển đổi
      `leads` → `customers` (giữ nguyên `LeadRepository` interface hiện
      có, gán đúng `organization_id`)
- [ ] **[M]** Viết migration `farms`, `animals`
- [ ] **[M]** **[Mới]** Viết migration `events` (cấu trúc bảng, chưa cần
      emit đầy đủ ngay — bổ sung dần ở các Sprint sau)
- [ ] **[L]** Viết RLS thật cho toàn bộ Nhóm A, B, D (xem
      `13_RLS_POLICY_PLAN.md`) — **nhớ luôn kèm điều kiện
      `organization_id`** (nguyên tắc #0)
- [ ] **[M]** Viết test RLS: chéo vai trò **và** chéo tổ chức

## Sprint 3 — Danh mục sản phẩm & Kho

Tương ứng Giai đoạn 3.

- [ ] **[M]** Viết migration `product_categories`, migrate dữ liệu từ
      `src/data/product-categories.ts`
- [ ] **[L]** Viết migration `products`, migrate dữ liệu từ
      `src/data/products.ts` vào đúng `organization_id` mặc định — giữ
      nguyên cờ `is_demo`
- [ ] **[M]** Viết migration `suppliers`, `inventory`
- [ ] **[M]** Viết migration `purchase_orders` + `purchase_order_items`
- [ ] **[L]** Thay `product-service.ts` đọc Supabase thay vì
      `src/data/products.ts` — không đổi chữ ký hàm
- [ ] **[M]** **[Mới]** Chốt cơ chế xác định `organization_id` cho
      request ẩn danh trên website (chặn nếu chưa xong)
- [ ] **[S]** RLS Nhóm A/C cho cụm này

## Sprint 4 — Thương mại

Tương ứng Giai đoạn 4.

- [ ] **[M]** Viết migration `sales_orders` + `sales_order_items`
- [ ] **[M]** Viết migration `invoices`
- [ ] **[M]** RLS Nhóm B/D/E cho cụm này

## Sprint 5 — Y tế & Chăm sóc (VETJOY CARE 5, Animal-centric) — rủi ro cao nhất

Tương ứng Giai đoạn 5. Khuyến nghị tách 2 Sprint con.

### Sprint 5a
- [ ] **[M]** Viết migration `appointments` — **`animal_id` NOT NULL
      ngay từ đầu**
- [ ] **[L]** Viết migration `treatments`
- [ ] **[L]** Viết migration `prescriptions` + `prescription_items`
- [ ] **[L]** RLS chặt cho `treatments`/`prescriptions` (Nhóm 🔴) + test
      xác nhận khách hàng A không đọc được hồ sơ khách hàng B **và** tổ
      chức A không đọc được hồ sơ tổ chức B

### Sprint 5b
- [ ] **[M]** Viết migration `vaccinations`
- [ ] **[L]** Viết migration `reminders` + quyết định giải pháp job nền
- [ ] **[M]** RLS cho `vaccinations`/`reminders`

## Sprint 6 — CRM tổng quát & Nền tảng

Tương ứng Giai đoạn 6.

- [ ] **[L]** Hoàn thiện Storage: tạo 7 bucket theo
      `14_STORAGE_PLAN.md` (path có `organization_id`), viết Storage
      policy thật
- [ ] **[M]** Viết migration `attachments` + service upload/signed URL
- [ ] **[S]** Viết migration `notes`
- [ ] **[M]** Viết migration `activities` + trigger/job sinh `activities`
      **từ `events`** (đã tạo ở Sprint 2)
- [ ] **[M]** Viết migration `notifications`, tích hợp kênh gửi thật
- [ ] **[S]** Viết migration `settings` (scope `global`/`organization`/`user`)
- [ ] **[L]** Viết migration `audit_logs` + trigger tự động ghi trên toàn
      bộ bảng 🔴/🟠 — nên làm song song Sprint 5

## Sprint 7 — Nền tảng dữ liệu cho AI (mở rộng — 3 bảng mới)

Tương ứng Giai đoạn 7. Chỉ chuẩn bị lưu trữ, không tích hợp model AI thật.

- [ ] **[M]** Viết migration `ai_conversations` + `ai_conversation_messages`
- [ ] **[S]** Viết migration `ai_feedback`
- [ ] **[M]** **[Mới]** Viết migration `ai_memory`, đảm bảo `is_verified`
      mặc định `false` và chỉ user thật được set `true`
- [ ] **[M]** **[Mới]** Viết migration `ai_recommendations`, đảm bảo
      `status` mặc định `pending_review`, không có đường nào cho
      `ai_system` tự chuyển `applied`
- [ ] **[S]** **[Mới]** Viết migration `ai_training_data`, quy trình xác
      minh bắt buộc trước khi dùng
- [ ] **[S]** RLS cho toàn bộ 6 bảng AI (nguyên tắc #5 —
      `13_RLS_POLICY_PLAN.md`)

## Không thuộc backlog này (nhắc lại phạm vi)

- Thiết kế/xây API layer cho từng bảng.
- Thiết kế màn hình quản trị (admin UI), bao gồm UI chọn/quản lý
  `organizations` nếu triển khai mô hình nhiều tổ chức.
- Tích hợp AI model thật, tích hợp Zalo thật, CI/CD migration.
- Bất kỳ thay đổi nào trên `src/` của website hiện tại ngoài việc thay
  đổi bên trong `src/services/*.ts` (đúng seam đã chuẩn bị từ Phase 1).

## File liên quan

- [`11_DATABASE_ARCHITECTURE.md`](./11_DATABASE_ARCHITECTURE.md) — nguyên tắc & ERD
- [`12_SUPABASE_SCHEMA.md`](./12_SUPABASE_SCHEMA.md) — chi tiết bảng
- [`13_RLS_POLICY_PLAN.md`](./13_RLS_POLICY_PLAN.md) — chiến lược RLS
- [`14_STORAGE_PLAN.md`](./14_STORAGE_PLAN.md) — kế hoạch Storage
- [`15_PHASE2_ROADMAP.md`](./15_PHASE2_ROADMAP.md) — thứ tự phụ thuộc kỹ thuật
