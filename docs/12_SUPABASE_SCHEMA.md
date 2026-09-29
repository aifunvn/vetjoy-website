# 12. Supabase Schema — Đặc tả chi tiết 40 bảng

> **Sprint 1 Revision** — cập nhật theo quyết định Founder: multi-tenant
> bằng `organizations` (bảng #35, mới), `animals` là trung tâm hồ sơ sức
> khỏe (`appointments`/`treatments` bắt buộc gắn `animal_id`), thêm bảng
> `events` (#36) và 4 bảng AI (#37–40). Xem lịch sử thay đổi ở
> [`11_DATABASE_ARCHITECTURE.md`](./11_DATABASE_ARCHITECTURE.md#lịch-sử-thay-đổi-tài-liệu-này).

> Đây là **đặc tả thiết kế**, không phải migration. Không có `CREATE
> TABLE` nào trong file này — kiểu dữ liệu ghi theo tên kiểu Postgres
> (nền tảng Supabase) để backend engineer chuyển thành migration thật ở
> Sprint sau. Xem nguyên tắc chung (UUID, soft delete, timestamp...) ở
> [`11_DATABASE_ARCHITECTURE.md`](./11_DATABASE_ARCHITECTURE.md).

## Quy ước đọc bảng dưới đây

Trừ khi ghi chú khác, **mọi bảng đều có sẵn 5 cột chuẩn** (không lặp lại
trong từng bảng field để đỡ dài dòng):

| Trường chuẩn | Kiểu | Mô tả |
| --- | --- | --- |
| `id` | `uuid` (PK, default `gen_random_uuid()`) | Khóa chính |
| `organization_id` | `uuid` (FK → `organizations.id`, **not null**) | Ranh giới multi-tenant — xem ngoại lệ bên dưới |
| `created_at` | `timestamptz` (default `now()`) | Thời điểm tạo |
| `updated_at` | `timestamptz` (default `now()`) | Thời điểm sửa gần nhất |
| `deleted_at` | `timestamptz` (null) | Soft delete — null nghĩa là còn hoạt động |

Bảng thuần tra cứu ít thay đổi (`species`, `breeds`, `provinces`,
`districts`, `communes`, `roles`, `permissions`) **không cần** `deleted_at`
— ghi chú riêng ở từng bảng.

### Ngoại lệ cột `organization_id`

**Không có** `organization_id` (dữ liệu dùng chung toàn hệ thống, không
thuộc riêng tổ chức nào — lý do chi tiết ở
[`11_DATABASE_ARCHITECTURE.md`](./11_DATABASE_ARCHITECTURE.md#multi-tenant--đã-chốt-hướng-a-organizations)):

- `organizations` (chính nó không có `organization_id`, chỉ có
  `parent_organization_id` tự tham chiếu)
- `provinces`, `districts`, `communes`
- `species`, `breeds`
- `roles`, `permissions` (+ bảng phụ trợ `user_roles`, `role_permissions`)
- `product_categories`

**`organization_id` nullable** (không bắt buộc, có ý nghĩa đặc biệt khi
null):

- `ai_prompt_templates` — null = template dùng chung toàn nền tảng
- `settings` — null = cấu hình toàn nền tảng (`scope = 'global'`)

Tất cả bảng còn lại trong danh sách 40 bảng: `organization_id` **bắt
buộc**.

---

## Cụm 0 — Multi-tenant (mới, Sprint 1 Revision)

### 35. `organizations`

**Mục đích**: gốc của toàn bộ multi-tenant — mọi bảng nghiệp vụ (trừ danh
mục dùng chung, xem "Ngoại lệ" ở trên) đều thuộc về một `organizations`.
Tự tham chiếu (`parent_organization_id`) để biểu diễn được cả mô hình
"nhiều chi nhánh của cùng VETJOY" lẫn "nền tảng phục vụ nhiều công ty thú
y độc lập" mà không cần đổi cấu trúc bảng khi mở rộng.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `parent_organization_id` | `uuid` | | FK tự tham chiếu → `organizations.id` (null = tổ chức gốc, không có công ty mẹ) |
| `code` | `text` | ✔ (unique) | Mã định danh ngắn (dùng cho subdomain/URL sau này nếu cần) |
| `name` | `text` | ✔ | Tên hiển thị |
| `legal_name` | `text` | | Tên pháp lý đầy đủ |
| `contact_email` | `text` | | |
| `contact_phone` | `text` | | |
| `status` | `text` | ✔ | `active` \| `trial` \| `suspended` |
| `plan_tier` | `text` | | Dự phòng cho mô hình SaaS trả phí tương lai — chưa dùng ở Sprint 1 |

**Khóa ngoại**: `parent_organization_id → organizations.id` (self-FK).
**Index**: unique `code`; `(parent_organization_id)`.
**Relationship**: 1–nhiều với hầu hết bảng nghiệp vụ trong hệ thống qua
cột chuẩn `organization_id`.
**RLS đề xuất**: chỉ `super_admin` tạo/sửa tổ chức; thành viên một tổ
chức chỉ `SELECT` được đúng bản ghi tổ chức của mình (để hiển thị tên
công ty trong UI), không thấy tổ chức khác.

> **Lưu ý triển khai quan trọng**: bảng này phải được tạo và có **ít nhất
> một bản ghi** (tổ chức mặc định cho chính VETJOY) **trước** bất kỳ
> migration nào khác — mọi bảng còn lại phụ thuộc `organization_id not
> null`. Xem thứ tự trong [`15_PHASE2_ROADMAP.md`](./15_PHASE2_ROADMAP.md).

---

## Cụm 1 — Định danh & Phân quyền

### 1. `users`

**Mục đích**: hồ sơ người dùng nội bộ, mở rộng từ Supabase Auth
(`auth.users`). Doctor/Employee/Dealer đều "là" một `users` + hồ sơ mở
rộng riêng — tránh lặp field đăng nhập ở nhiều nơi.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `auth_user_id` | `uuid` | ✔ | Trỏ tới `auth.users.id` của Supabase |
| `full_name` | `text` | ✔ | Họ tên hiển thị |
| `phone` | `text` | | Số điện thoại |
| `email` | `text` | | Email |
| `avatar_attachment_id` | `uuid` | | FK → `attachments.id` |
| `status` | `text` | ✔ | `active` \| `suspended` \| `invited` |
| `last_login_at` | `timestamptz` | | |

**Khóa ngoại**: `avatar_attachment_id → attachments.id`.
**Index**: unique trên `auth_user_id`; index trên `phone`, `email`.
**Relationship**: 1–1 (tuỳ chọn) với `customers`, `doctors`, `employees`,
`dealers` — một người có thể vừa là nhân viên vừa từng là khách hàng,
nhưng thường chỉ 1 vai trò nghiệp vụ chính. Nhiều-nhiều với `roles` qua
`user_roles`.
**RLS đề xuất**: nhóm "Chỉ chính chủ + Nội bộ" — xem `13_RLS_POLICY_PLAN.md`.

### 2. `roles`

**Mục đích**: danh sách vai trò hệ thống. Không có `deleted_at` (danh mục
cấu hình, xoá bằng cách vô hiệu hoá qua `is_active`).

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `code` | `text` | ✔ (unique) | `super_admin`, `admin`, `doctor`, `employee`, `dealer_owner`, `customer`, `ai_system` |
| `name` | `text` | ✔ | Tên hiển thị tiếng Việt |
| `description` | `text` | | |
| `is_active` | `boolean` | ✔ (default true) | |

**Index**: unique `code`.
**Relationship**: nhiều-nhiều với `users` qua `user_roles`; nhiều-nhiều
với `permissions` qua `role_permissions`.
**RLS đề xuất**: chỉ đọc cho mọi authenticated user; ghi chỉ `super_admin`.

**Bảng phụ trợ `user_roles`**: `user_id FK→users`, `role_id FK→roles`,
`assigned_at timestamptz`. Khóa chính composite `(user_id, role_id)`.

### 3. `permissions`

**Mục đích**: quyền hạn chi tiết theo module, dùng để kiểm soát UI/API ở
tầng ứng dụng (không chỉ dựa vào RLS).

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `code` | `text` | ✔ (unique) | ví dụ `products.write`, `prescriptions.approve` |
| `module` | `text` | ✔ | Nhóm chức năng (products, crm, medical, finance...) |
| `name` | `text` | ✔ | Tên hiển thị |
| `description` | `text` | | |

**Index**: unique `code`; index `module`.
**Relationship**: nhiều-nhiều với `roles` qua `role_permissions`.
**RLS đề xuất**: chỉ đọc cho authenticated; ghi chỉ `super_admin`.

**Bảng phụ trợ `role_permissions`**: `role_id FK→roles`,
`permission_id FK→permissions`. Khóa chính composite.

---

## Cụm 2 — Địa lý Việt Nam

### 24. `provinces`

Không có `deleted_at`/`updated_at` cần thiết (danh mục hành chính hiếm
khi đổi).

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `code` | `text` | ✔ (unique) | Mã tỉnh/thành theo chuẩn hành chính |
| `name` | `text` | ✔ | Tên tỉnh/thành |

**Index**: unique `code`.
**Relationship**: 1–nhiều với `districts`.
**RLS đề xuất**: đọc công khai (kể cả anon — cần cho form địa chỉ trên
website).

### 25. `districts`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `province_id` | `uuid` | ✔ | FK → `provinces.id` |
| `code` | `text` | ✔ | Mã quận/huyện |
| `name` | `text` | ✔ | Tên quận/huyện |

**Khóa ngoại**: `province_id → provinces.id`.
**Index**: `(province_id)`; unique `(province_id, code)`.
**Relationship**: 1–nhiều với `communes`.
**RLS đề xuất**: đọc công khai.

### 26. `communes`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `district_id` | `uuid` | ✔ | FK → `districts.id` |
| `code` | `text` | ✔ | Mã xã/phường |
| `name` | `text` | ✔ | Tên xã/phường |

**Khóa ngoại**: `district_id → districts.id`.
**Index**: `(district_id)`; unique `(district_id, code)`.
**Relationship**: được `customers`/`farms`/`dealers` tham chiếu tới để
chuẩn hoá địa chỉ (thay vì lưu tỉnh/huyện/xã dạng text tự do).
**RLS đề xuất**: đọc công khai.

> **Ghi chú nguồn dữ liệu**: 3 bảng địa lý này nên được nạp (seed) từ bộ
> dữ liệu hành chính Việt Nam chính thức — **không tự bịa dữ liệu địa lý**,
> cần Founder/dev xác nhận nguồn (ví dụ dữ liệu công bố của Tổng cục Thống
> kê) trước khi seed.

---

## Cụm 3 — Con người & Doanh nghiệp

### 21. `doctors`

**Mục đích**: hồ sơ chuyên môn bác sĩ thú y — tách khỏi `users` vì chỉ
doctor mới có các trường hành nghề.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `user_id` | `uuid` | ✔ (unique) | FK → `users.id` |
| `license_no` | `text` | | Số chứng chỉ hành nghề |
| `specialties` | `text[]` | | Chuyên môn (gia súc, gia cầm, thú cưng...) |
| `years_experience` | `integer` | | |
| `bio` | `text` | | Tiểu sử hiển thị public (khi có ảnh/thông tin thật — xem `06_CONTENT_GUIDE.md`) |
| `avatar_attachment_id` | `uuid` | | FK → `attachments.id` |
| `is_active` | `boolean` | ✔ (default true) | |

**Khóa ngoại**: `user_id → users.id`; `avatar_attachment_id → attachments.id`.
**Index**: unique `user_id`.
**Relationship**: 1–nhiều với `appointments`, `treatments`, `prescriptions`, `vaccinations`.
**RLS đề xuất**: đọc công khai các trường public (tên, chuyên môn, bio) để
hiển thị trên website; ghi chỉ chính doctor đó + admin.

### 22. `employees`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `user_id` | `uuid` | ✔ (unique) | FK → `users.id` |
| `employee_code` | `text` | ✔ (unique) | Mã nhân viên |
| `department` | `text` | | Bộ phận |
| `position` | `text` | | Chức danh |
| `hired_at` | `date` | | |
| `is_active` | `boolean` | ✔ (default true) | |

**Khóa ngoại**: `user_id → users.id`.
**Index**: unique `user_id`, unique `employee_code`.
**Relationship**: có thể là `created_by`/`assigned_to` trên nhiều bảng
CRM (`activities`, `sales_orders`, `appointments`...).
**RLS đề xuất**: nội bộ — chỉ nhân viên/admin đọc được toàn bộ danh sách.

### 23. `dealers`

**Mục đích**: đại lý/đối tác phân phối — nguồn gốc thường là một
`DealerLead` từ website đã được duyệt.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `user_id` | `uuid` | | FK → `users.id` (nullable — đại lý có thể chưa có tài khoản đăng nhập) |
| `business_name` | `text` | ✔ | Tên cửa hàng/doanh nghiệp |
| `business_scale` | `text` | | `ho_kinh_doanh_nho` \| `cua_hang` \| `dai_ly_khu_vuc` \| `nha_phan_phoi` (khớp `dealer-schema.ts` hiện có) |
| `tax_code` | `text` | | Mã số thuế |
| `commune_id` | `uuid` | | FK → `communes.id` |
| `address_detail` | `text` | | Địa chỉ chi tiết |
| `status` | `text` | ✔ | `pending` \| `active` \| `suspended` |
| `source_lead_id` | `uuid` | | Tham chiếu `leads.lead_id` (Phase 1) — không FK cứng vì khác schema/migration |
| `onboarded_at` | `timestamptz` | | |

**Khóa ngoại**: `user_id → users.id`; `commune_id → communes.id`.
**Index**: `(status)`; `(commune_id)`.
**Relationship**: 1–nhiều với `customers` (đại lý phụ trách một nhóm
khách hàng khu vực), 1–nhiều với `sales_orders`.
**RLS đề xuất**: chính đại lý đọc/sửa dữ liệu của mình; admin/employee
đọc toàn bộ.

### 4. `customers`

**Mục đích**: khách hàng — điểm hội tụ dữ liệu từ website (`leads`) sang
CRM thật. Đây là bảng trung tâm nhất của toàn hệ thống.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `user_id` | `uuid` | | FK → `users.id` (nullable — khách có thể chưa có tài khoản) |
| `dealer_id` | `uuid` | | FK → `dealers.id` (đại lý phụ trách, nullable — thuần nghiệp vụ, **không** còn ý nghĩa ranh giới tenant kể từ Sprint 1 Revision; ranh giới tenant nay là `organization_id`) |
| `full_name` | `text` | ✔ | |
| `phone` | `text` | ✔ | |
| `zalo` | `text` | | |
| `email` | `text` | | |
| `customer_type` | `text` | ✔ | `gia_suc` \| `gia_cam` \| `thu_cung` \| `trang_trai` \| `dai_ly` \| `khac` (khớp `ConsultationLead.customerType` hiện có) |
| `commune_id` | `uuid` | | FK → `communes.id` |
| `address_detail` | `text` | | |
| `source_lead_id` | `uuid` | | Tham chiếu `leads.lead_id` (Phase 1), không FK cứng |
| `source_utm` | `jsonb` | | Sao chép attribution UTM gốc từ lead (nếu có) |

**Khóa ngoại**: `user_id → users.id`; `dealer_id → dealers.id`;
`commune_id → communes.id`.
**Index**: `(phone)`; `(dealer_id)`; `(customer_type)`.
**Relationship**: 1–nhiều với `farms`, `animals`, `sales_orders`,
`appointments`; polymorphic target của `attachments`/`notes`/`activities`.
**RLS đề xuất**: chính khách hàng đọc/sửa dữ liệu của mình (qua
`user_id`); nhân viên/bác sĩ/đại lý phụ trách đọc theo phạm vi được giao.

---

## Cụm 4 — Trang trại & Vật nuôi

### 7. `species`

Không cần `deleted_at` (danh mục sinh học ổn định).

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `code` | `text` | ✔ (unique) | `heo`, `ga`, `vit`, `bo`, `cho`, `meo`... |
| `name` | `text` | ✔ | Tên hiển thị |
| `animal_target` | `text` | ✔ | `gia_suc` \| `gia_cam` \| `thu_cung` \| `khac` (khớp `AnimalTargetSlug` hiện có trong `src/types/product.ts`) |

**Index**: unique `code`.
**Relationship**: 1–nhiều với `breeds`, `animals`.
**RLS đề xuất**: đọc công khai.

### 8. `breeds`

Không cần `deleted_at`.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `species_id` | `uuid` | ✔ | FK → `species.id` |
| `name` | `text` | ✔ | Tên giống |

**Khóa ngoại**: `species_id → species.id`.
**Index**: `(species_id)`.
**Relationship**: 1–nhiều với `animals`.
**RLS đề xuất**: đọc công khai.

### 5. `farms`

**Mục đích**: trang trại/hộ chăn nuôi — một khách hàng có thể có nhiều
trang trại (persona "Chủ trang trại"/"Người chăn nuôi gia súc/gia cầm").

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `customer_id` | `uuid` | ✔ | FK → `customers.id` |
| `name` | `text` | ✔ | Tên trang trại |
| `farm_type` | `text` | | `gia_suc` \| `gia_cam` \| `mixed` |
| `commune_id` | `uuid` | | FK → `communes.id` |
| `address_detail` | `text` | | |
| `area_size` | `numeric` | | Diện tích (m²/ha — đơn vị thống nhất khi triển khai) |
| `herd_capacity` | `integer` | | Quy mô đàn tối đa dự kiến |

**Khóa ngoại**: `customer_id → customers.id`; `commune_id → communes.id`.
**Index**: `(customer_id)`.
**Relationship**: 1–nhiều với `animals`.
**RLS đề xuất**: chủ khách hàng + nhân viên/bác sĩ được giao phụ trách.

### 6. `animals` — TRUNG TÂM HỒ SƠ SỨC KHỎE (Animal-centric)

**Mục đích**: **bảng quan trọng nhất của toàn hệ thống** (quyết định
Founder, Sprint 1 Revision) — mọi dữ liệu y tế (`appointments`,
`treatments`, `prescriptions`, `vaccinations`) đều bắt buộc neo vào một
`animals.id` cụ thể, không tuỳ chọn. `customers` chỉ trả lời "ai chịu
trách nhiệm", còn "lịch sử sức khỏe" luôn đọc từ `animals` trước tiên.
Vừa dùng cho vật nuôi cá thể (chó/mèo) vừa dùng cho **bản ghi cấp đàn**
(gia súc/gia cầm số lượng lớn, không đặt tên từng con) qua cờ `is_herd` —
cả hai trường hợp, `animals` vẫn là đơn vị hồ sơ trung tâm, chỉ khác đơn
vị đại diện (cá thể vs. đàn).

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `customer_id` | `uuid` | ✔ | FK → `customers.id` |
| `farm_id` | `uuid` | | FK → `farms.id` (null với thú cưng không thuộc trang trại) |
| `species_id` | `uuid` | ✔ | FK → `species.id` |
| `breed_id` | `uuid` | | FK → `breeds.id` |
| `animal_code` | `text` | | Mã nội bộ (số tai, vòng chân...) |
| `name` | `text` | | Tên riêng (thú cưng); null nếu `is_herd = true` |
| `is_herd` | `boolean` | ✔ (default false) | true = bản ghi đại diện cho cả đàn |
| `herd_count` | `integer` | | Số lượng con trong đàn (chỉ có ý nghĩa khi `is_herd = true`) |
| `birth_date` | `date` | | |
| `gender` | `text` | | `male` \| `female` \| `unknown` |
| `status` | `text` | ✔ | `alive` \| `deceased` \| `sold` \| `transferred` |
| `avatar_attachment_id` | `uuid` | | FK → `attachments.id` |

**Khóa ngoại**: `customer_id → customers.id`; `farm_id → farms.id`;
`species_id → species.id`; `breed_id → breeds.id`;
`avatar_attachment_id → attachments.id`.
**Index**: `(customer_id)`; `(farm_id)`; `(species_id)`.
**Relationship**: 1–nhiều với `appointments`, `treatments`,
`prescriptions`, `vaccinations`; polymorphic target của
`attachments`/`notes`/`activities`.
**RLS đề xuất**: chủ khách hàng đọc/sửa vật nuôi của mình; bác sĩ/nhân
viên đọc theo lịch hẹn/điều trị được giao.

---

## Cụm 5 — Danh mục sản phẩm & Kho

### 10. `product_categories`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `slug` | `text` | ✔ (unique) | Khớp `ProductCategorySlug` hiện có (`thuoc-thu-y`, `vaccine`, `thuc-an`, `che-pham-sinh-hoc`, `sat-trung`, `dung-cu-thu-y`, `cham-soc-thu-cung`) |
| `name` | `text` | ✔ | |
| `description` | `text` | | |
| `parent_id` | `uuid` | | FK tự tham chiếu → `product_categories.id` (dự phòng danh mục con) |

**Khóa ngoại**: `parent_id → product_categories.id` (self-FK).
**Index**: unique `slug`.
**Relationship**: 1–nhiều với `products`.
**RLS đề xuất**: đọc công khai (kể cả anon — cần cho trang Sản phẩm).

### 9. `products`

**Mục đích**: thay thế `src/data/products.ts` (demo data) khi có dữ liệu
thật — vẫn giữ đúng các field đã tồn tại trong `Product` type hiện có để
migrate dữ liệu không phải viết lại UI.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `sku` | `text` | ✔ (unique) | Mã sản phẩm |
| `slug` | `text` | ✔ (unique) | Dùng cho URL `/san-pham/[slug]` — khớp field hiện có |
| `name` | `text` | ✔ | |
| `category_id` | `uuid` | ✔ | FK → `product_categories.id` |
| `short_description` | `text` | | |
| `usage_instructions` | `text` | | Khớp field `usage`/`instructions` hiện có — **không tự bịa nội dung**, xem `06_CONTENT_GUIDE.md` |
| `composition` | `text` | | **Chỉ nhập khi đã xác minh chuyên môn** |
| `packaging` | `text` | | Quy cách đóng gói |
| `manufacturer` | `text` | | |
| `target_animal_types` | `text[]` | | Mảng `AnimalTargetSlug` |
| `unit` | `text` | | Đơn vị tính |
| `price` | `numeric` | | Nullable — giá có thể chưa công bố công khai |
| `primary_image_attachment_id` | `uuid` | | FK → `attachments.id` |
| `is_active` | `boolean` | ✔ (default true) | |
| `is_demo` | `boolean` | ✔ (default true cho tới khi xác minh) | Kế thừa trực tiếp cờ `isDemo` hiện có trên website |

**Khóa ngoại**: `category_id → product_categories.id`;
`primary_image_attachment_id → attachments.id`.
**Index**: unique `sku`, unique `slug`; `(category_id)`; `(is_active)`.
**Relationship**: 1–nhiều với `inventory`, `purchase_order_items`,
`sales_order_items`, `prescription_items`, `vaccinations`.
**RLS đề xuất**: đọc công khai sản phẩm `is_active = true`; ghi chỉ
admin/employee có quyền `products.write`.

### 12. `suppliers`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `name` | `text` | ✔ | |
| `contact_name` | `text` | | |
| `phone` | `text` | | |
| `email` | `text` | | |
| `address` | `text` | | |
| `tax_code` | `text` | | |
| `is_active` | `boolean` | ✔ (default true) | |

**Index**: `(is_active)`.
**Relationship**: 1–nhiều với `purchase_orders`.
**RLS đề xuất**: nội bộ — chỉ nhân viên có quyền `inventory.write`.

### 11. `inventory`

**Mục đích**: tồn kho — tách khỏi `products` vì có thể có nhiều kho/chi
nhánh trong tương lai (`warehouse_location`).

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `product_id` | `uuid` | ✔ | FK → `products.id` |
| `warehouse_location` | `text` | ✔ (default `"main"`) | Mã/tên kho |
| `quantity_on_hand` | `numeric` | ✔ (default 0) | Tồn thực tế |
| `quantity_reserved` | `numeric` | ✔ (default 0) | Đã giữ cho đơn hàng chưa xuất |
| `reorder_level` | `numeric` | | Ngưỡng cảnh báo nhập thêm |

**Khóa ngoại**: `product_id → products.id`.
**Index**: unique `(product_id, warehouse_location)`.
**Relationship**: nhiều–1 với `products`.
**RLS đề xuất**: nội bộ — nhân viên kho/admin.

---

## Cụm 6 — Thương mại

### 13. `purchase_orders`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `po_number` | `text` | ✔ (unique) | |
| `supplier_id` | `uuid` | ✔ | FK → `suppliers.id` |
| `status` | `text` | ✔ | `draft` \| `ordered` \| `received` \| `cancelled` |
| `ordered_at` | `timestamptz` | | |
| `expected_at` | `date` | | |
| `received_at` | `timestamptz` | | |
| `total_amount` | `numeric` | | Tính từ `purchase_order_items`, lưu cache |
| `created_by` | `uuid` | | FK → `users.id` |

**Khóa ngoại**: `supplier_id → suppliers.id`; `created_by → users.id`.
**Index**: unique `po_number`; `(supplier_id)`; `(status)`.
**Relationship**: 1–nhiều với `purchase_order_items`.
**RLS đề xuất**: nội bộ — nhân viên/admin có quyền `inventory.write`.

**Bảng phụ trợ `purchase_order_items`**: `purchase_order_id FK`,
`product_id FK`, `quantity numeric`, `unit_cost numeric`.

### 14. `sales_orders`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `order_number` | `text` | ✔ (unique) | |
| `customer_id` | `uuid` | ✔ | FK → `customers.id` |
| `dealer_id` | `uuid` | | FK → `dealers.id` (đơn qua kênh đại lý) |
| `status` | `text` | ✔ | `pending` \| `confirmed` \| `fulfilled` \| `cancelled` |
| `order_source` | `text` | ✔ | `website` \| `app` \| `phone` \| `dealer` |
| `total_amount` | `numeric` | | Cache từ `sales_order_items` |
| `created_by` | `uuid` | | FK → `users.id` |

**Khóa ngoại**: `customer_id → customers.id`; `dealer_id → dealers.id`;
`created_by → users.id`.
**Index**: unique `order_number`; `(customer_id)`; `(dealer_id)`;
`(status)`.
**Relationship**: 1–nhiều với `sales_order_items`; 1–1 (tuỳ chọn) với
`invoices`.
**RLS đề xuất**: khách hàng xem đơn của mình; đại lý xem đơn mình tạo;
nhân viên/admin xem toàn bộ.

**Bảng phụ trợ `sales_order_items`**: `sales_order_id FK`,
`product_id FK`, `quantity numeric`, `unit_price numeric`.

### 15. `invoices`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `invoice_number` | `text` | ✔ (unique) | |
| `sales_order_id` | `uuid` | ✔ | FK → `sales_orders.id` |
| `customer_id` | `uuid` | ✔ | FK → `customers.id` (denormalize để truy vấn nhanh) |
| `amount` | `numeric` | ✔ | |
| `tax_amount` | `numeric` | (default 0) | |
| `status` | `text` | ✔ | `unpaid` \| `paid` \| `overdue` \| `void` |
| `due_date` | `date` | | |
| `paid_at` | `timestamptz` | | |

**Khóa ngoại**: `sales_order_id → sales_orders.id`;
`customer_id → customers.id`.
**Index**: unique `invoice_number`; `(sales_order_id)`; `(status)`.
**Relationship**: nhiều–1 với `sales_orders`.
**RLS đề xuất**: khách hàng xem hoá đơn của mình; nhân viên tài
chính/admin xem toàn bộ. **Nhạy cảm tài chính — cân nhắc audit_logs bắt
buộc** trên bảng này.

---

## Cụm 7 — Y tế & Chăm sóc (VETJOY CARE 5)

### 20. `appointments`

**Mục đích**: lịch hẹn — điểm bắt đầu của một chu trình VETJOY CARE 5.
**Cập nhật Sprint 1 Revision**: `animal_id` chuyển từ tuỳ chọn sang **bắt
buộc**, đúng nguyên tắc animal-centric — nếu khách đặt lịch mà chưa rõ sẽ
khám con nào, quy trình nghiệp vụ cần tạo trước một bản ghi `animals`
tạm (ví dụ `status` đặc biệt hoặc tên "chưa xác định") thay vì để
`appointments` trôi nổi không gắn vật nuôi.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `customer_id` | `uuid` | ✔ | FK → `customers.id` |
| `animal_id` | `uuid` | ✔ | FK → `animals.id` — **bắt buộc** (animal-centric, xem ghi chú trên) |
| `doctor_id` | `uuid` | | FK → `doctors.id` |
| `employee_id` | `uuid` | | FK → `employees.id` (nhân viên hỗ trợ đặt lịch) |
| `scheduled_at` | `timestamptz` | ✔ | |
| `status` | `text` | ✔ | `requested` \| `confirmed` \| `completed` \| `cancelled` \| `no_show` |
| `channel` | `text` | ✔ | `website` \| `app` \| `phone` \| `zalo` |
| `source_lead_id` | `uuid` | | Tham chiếu `leads.lead_id` (Phase 1) |

**Khóa ngoại**: `customer_id → customers.id`; `animal_id → animals.id`;
`doctor_id → doctors.id`; `employee_id → employees.id`.
**Index**: `(customer_id)`; `(doctor_id, scheduled_at)`; `(status)`.
**Relationship**: 1–1 (tuỳ chọn) với `treatments`; polymorphic target của
`reminders` (nhắc lịch hẹn).
**RLS đề xuất**: khách hàng xem lịch hẹn của mình; bác sĩ xem lịch được
giao; nhân viên/admin xem toàn bộ.

### 17. `treatments`

**Mục đích**: đúng 3 bước đầu của VETJOY CARE 5 — Ghi nhận / Đánh giá /
Giải pháp — trong một bản ghi.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `animal_id` | `uuid` | ✔ | FK → `animals.id` |
| `doctor_id` | `uuid` | ✔ | FK → `doctors.id` |
| `appointment_id` | `uuid` | | FK → `appointments.id` |
| `visit_date` | `date` | ✔ | |
| `chief_complaint` | `text` | | **Bước 1 — Ghi nhận**: biểu hiện được ghi nhận |
| `assessment` | `text` | | **Bước 2 — Đánh giá**: đánh giá của bác sĩ |
| `plan` | `text` | | **Bước 3 — Giải pháp**: hướng xử lý đề xuất |
| `follow_up_required` | `boolean` | (default false) | Có cần bước 4 (Theo dõi) hay không |
| `status` | `text` | ✔ | `ongoing` \| `resolved` |

**Khóa ngoại**: `animal_id → animals.id`; `doctor_id → doctors.id`;
`appointment_id → appointments.id`.
**Index**: `(animal_id)`; `(doctor_id)`.
**Relationship**: 1–nhiều với `prescriptions`; 1–nhiều (theo dõi) với
`reminders`; polymorphic target của `attachments` (ảnh vết thương...) và
`notes`.
**RLS đề xuất**: **Dữ liệu y tế nhạy cảm** — chỉ bác sĩ phụ trách +
khách hàng chủ vật nuôi + admin. Bắt buộc ghi `audit_logs` khi sửa.

### 16. `prescriptions`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `treatment_id` | `uuid` | ✔ | FK → `treatments.id` |
| `doctor_id` | `uuid` | ✔ | FK → `doctors.id` |
| `animal_id` | `uuid` | ✔ | FK → `animals.id` (denormalize để truy vấn nhanh) |
| `issued_at` | `timestamptz` | ✔ | |
| `notes` | `text` | | Hướng dẫn thêm của bác sĩ |
| `status` | `text` | ✔ | `active` \| `completed` \| `cancelled` |

**Khóa ngoại**: `treatment_id → treatments.id`; `doctor_id → doctors.id`;
`animal_id → animals.id`.
**Index**: `(animal_id)`; `(doctor_id)`.
**Relationship**: 1–nhiều với `prescription_items`.
**RLS đề xuất**: như `treatments` — dữ liệu y tế nhạy cảm, chỉ bác sĩ kê
đơn + khách hàng liên quan + admin. **Bắt buộc audit_logs**.

**Bảng phụ trợ `prescription_items`**: `prescription_id FK`,
`product_id FK` (thuốc), `dosage text`, `frequency text`,
`duration_days integer`, `quantity numeric`. — **Toàn bộ giá trị các
trường này PHẢI do bác sĩ nhập qua nghiệp vụ thật, không được seed/tự
sinh dữ liệu mẫu** (đúng nguyên tắc "không tự bịa liều dùng" xuyên suốt
dự án).

### 18. `vaccinations`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `animal_id` | `uuid` | ✔ | FK → `animals.id` |
| `product_id` | `uuid` | | FK → `products.id` (vaccine sử dụng) |
| `doctor_id` | `uuid` | | FK → `doctors.id` |
| `administered_at` | `timestamptz` | | Null nếu chỉ mới lên lịch, chưa tiêm |
| `next_due_at` | `date` | | Lịch tiêm nhắc lại |
| `batch_no` | `text` | | Số lô vaccine (truy xuất nguồn gốc) |
| `status` | `text` | ✔ | `scheduled` \| `administered` \| `overdue` \| `skipped` |

**Khóa ngoại**: `animal_id → animals.id`; `product_id → products.id`;
`doctor_id → doctors.id`.
**Index**: `(animal_id)`; `(next_due_at)` — phục vụ job quét lịch quá hạn
để sinh `reminders`.
**Relationship**: nguồn phát sinh chính của `reminders`
(`reminder_type = 'vaccination'`).
**RLS đề xuất**: như dữ liệu y tế — khách hàng xem của vật nuôi mình,
bác sĩ/nhân viên xem theo phân công.

### 19. `reminders`

**Mục đích**: engine nhắc lịch **dùng chung** cho nhiều nguồn (vaccine
đến hạn, tái khám, hết hàng cần đặt thêm, lịch hẹn sắp tới) — polymorphic
để không phải tạo bảng nhắc lịch riêng cho từng tính năng.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `reminder_type` | `text` | ✔ | `vaccination` \| `follow_up` \| `reorder` \| `appointment` \| `custom` |
| `reference_table` | `text` | ✔ | Tên bảng gốc (`vaccinations`, `treatments`, `appointments`, `inventory`...) |
| `reference_id` | `uuid` | ✔ | ID bản ghi gốc (polymorphic, không FK cứng) |
| `customer_id` | `uuid` | | FK → `customers.id` (ai sẽ nhận nhắc nhở) |
| `due_at` | `timestamptz` | ✔ | |
| `channel` | `text` | ✔ | `zalo` \| `email` \| `sms` \| `push` \| `in_app` |
| `status` | `text` | ✔ | `pending` \| `sent` \| `acknowledged` \| `dismissed` |

**Khóa ngoại**: `customer_id → customers.id`.
**Index**: `(due_at, status)` — phục vụ job quét nhắc lịch đến hạn;
`(reference_table, reference_id)`.
**Relationship**: polymorphic tới `vaccinations`/`treatments`/
`appointments`/`inventory`; nguồn tạo `notifications`.
**RLS đề xuất**: khách hàng xem nhắc lịch của mình; hệ thống
(service role) tạo/cập nhật.

---

## Cụm 8 — CRM tổng quát (polymorphic)

### 27. `attachments`

**Mục đích**: mọi file đính kèm trong hệ thống (ảnh vật nuôi, ảnh vết
thương, scan đơn thuốc, ảnh sản phẩm, avatar bác sĩ...) — tham chiếu tới
Supabase Storage, xem chi tiết bucket ở
[`14_STORAGE_PLAN.md`](./14_STORAGE_PLAN.md).

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `owner_table` | `text` | ✔ | Tên bảng sở hữu (`animals`, `treatments`, `products`, `doctors`...) |
| `owner_id` | `uuid` | ✔ | ID bản ghi sở hữu (polymorphic) |
| `file_path` | `text` | ✔ | Đường dẫn trong Supabase Storage bucket |
| `file_type` | `text` | ✔ | MIME type |
| `file_size` | `integer` | | Byte |
| `uploaded_by` | `uuid` | | FK → `users.id` |

**Khóa ngoại**: `uploaded_by → users.id`.
**Index**: `(owner_table, owner_id)`.
**Relationship**: polymorphic tới hầu hết bảng nghiệp vụ.
**RLS đề xuất**: kế thừa quyền của bảng chủ sở hữu (kiểm tra ở tầng ứng
dụng, vì Postgres không tự động lan truyền RLS qua cột polymorphic — xem
`13_RLS_POLICY_PLAN.md`).

### 28. `notes`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `owner_table` | `text` | ✔ | |
| `owner_id` | `uuid` | ✔ | |
| `author_id` | `uuid` | ✔ | FK → `users.id` |
| `body` | `text` | ✔ | |
| `is_internal` | `boolean` | ✔ (default true) | true = chỉ nội bộ thấy, không hiện cho khách hàng |

**Khóa ngoại**: `author_id → users.id`.
**Index**: `(owner_table, owner_id)`.
**Relationship**: polymorphic — ghi chú nội bộ CRM gắn vào bất kỳ đối
tượng nào.
**RLS đề xuất**: nội bộ (nhân viên/bác sĩ/admin) — khách hàng không đọc
được `notes` (khác với `activities` có thể có phần hiển thị công khai).

### 29. `activities`

**Mục đích**: dòng thời gian hoạt động dễ đọc — "khách hàng X đã đặt lịch
hẹn", "đơn hàng Y chuyển sang đã giao"... Khác `audit_logs` (xem
mục nguyên tắc #8 ở `11_DATABASE_ARCHITECTURE.md`).

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `actor_id` | `uuid` | | FK → `users.id` (null nếu hệ thống tự sinh) |
| `subject_table` | `text` | ✔ | |
| `subject_id` | `uuid` | ✔ | |
| `activity_type` | `text` | ✔ | ví dụ `appointment_created`, `order_status_changed`, `ai_conversation_started` |
| `description` | `text` | ✔ | Mô tả dễ đọc |
| `metadata` | `jsonb` | | Dữ liệu có cấu trúc kèm theo (ví dụ trạng thái cũ/mới) |

**Khóa ngoại**: `actor_id → users.id`.
**Index**: `(subject_table, subject_id, created_at desc)`.
**Relationship**: polymorphic tới mọi bảng nghiệp vụ. **Cập nhật Sprint 1
Revision**: nên được sinh ra từ `events` (thêm cột `source_event_id`, xem
dưới) thay vì mỗi tính năng tự ghi độc lập — xem nguyên tắc #6 ở
`11_DATABASE_ARCHITECTURE.md`.
**RLS đề xuất**: nội bộ; có thể lọc một phần hiển thị cho khách hàng qua
view riêng (không phải RLS trực tiếp trên bảng gốc) — ngoài phạm vi
Sprint 1.

**Cập nhật field Sprint 1 Revision**: thêm `source_event_id uuid` (FK →
`events.id`, nullable — bản ghi `activities` được sinh thủ công trước khi
có `events` sẽ để trống).

### 36. `events` (mới, Sprint 1 Revision)

**Mục đích**: **timeline toàn hệ thống** — bảng append-only ghi lại MỌI
sự kiện xảy ra (không chỉ những gì được chọn lọc để hiển thị như
`activities`). Là nguồn phát sinh cho `activities` (lọc/diễn giải lại cho
người đọc) và `notifications` (kích hoạt thông báo), đồng thời chuẩn bị
sẵn dữ liệu thô cho automation (Phase 2.5) và phân tích/huấn luyện AI sau
này — xem nguyên tắc #6 ở
[`11_DATABASE_ARCHITECTURE.md`](./11_DATABASE_ARCHITECTURE.md).

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `event_type` | `text` | ✔ | ví dụ `appointment.created`, `order.status_changed`, `ai_conversation.started`, `vaccination.overdue` — quy ước đặt tên `<đối_tượng>.<hành_động>` |
| `event_source` | `text` | ✔ | Dịch vụ/tầng phát sinh sự kiện (`website`, `app`, `api`, `job_scheduler`, `ai_system`) |
| `subject_table` | `text` | ✔ | Bảng liên quan (polymorphic) |
| `subject_id` | `uuid` | ✔ | ID bản ghi liên quan (polymorphic) |
| `actor_id` | `uuid` | | FK → `users.id` (null nếu hệ thống tự sinh, ví dụ job quét `vaccinations.next_due_at`) |
| `payload` | `jsonb` | | Dữ liệu đầy đủ tại thời điểm sự kiện xảy ra (snapshot), phục vụ replay/phân tích sau này |
| `occurred_at` | `timestamptz` | ✔ (default `now()`) | Thời điểm sự kiện thực sự xảy ra (có thể khác `created_at` nếu ghi log trễ, ví dụ đồng bộ từ app offline) |

**Khóa ngoại**: `actor_id → users.id`.
**Index**: `(organization_id, subject_table, subject_id, occurred_at desc)`;
`(event_type)`; `(occurred_at desc)` — phục vụ truy vấn "toàn bộ hoạt
động gần đây của tổ chức X".
**Relationship**: polymorphic tới mọi bảng; nguồn của `activities` (qua
`activities.source_event_id`) và một phần `notifications`
(`notifications.related_table`/`related_id` có thể trỏ cùng đối tượng).
**RLS đề xuất**: nội bộ (nhân viên/bác sĩ/admin theo phạm vi tổ chức),
**không cho client ghi trực tiếp** — chỉ service role/trigger hệ thống
ghi, tương tự nguyên tắc của `audit_logs`. Bảng này **không có
`deleted_at`** (append-only tuyệt đối, không sửa/xoá).

---

## Cụm 9 — AI

### 30. `ai_conversations`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `customer_id` | `uuid` | | FK → `customers.id` (null nếu khách vãng lai chưa định danh) |
| `user_id` | `uuid` | | FK → `users.id` (nhân viên test/hỗ trợ) |
| `channel` | `text` | ✔ | `website_widget` \| `zalo` \| `app` |
| `status` | `text` | ✔ | `active` \| `ended` \| `handed_off` |
| `handed_off_to_doctor_id` | `uuid` | | FK → `doctors.id` (khi AI chuyển tiếp cho bác sĩ thật) |
| `started_at` | `timestamptz` | ✔ | |
| `ended_at` | `timestamptz` | | |
| `summary` | `text` | | Tóm tắt hội thoại (sinh tự động hoặc thủ công) |

**Khóa ngoại**: `customer_id → customers.id`; `user_id → users.id`;
`handed_off_to_doctor_id → doctors.id`.
**Index**: `(customer_id)`; `(status)`.
**Relationship**: 1–nhiều với `ai_conversation_messages`,
`ai_feedback`.
**RLS đề xuất**: khách hàng xem hội thoại của mình; nhân viên/admin xem
toàn bộ để giám sát chất lượng AI.

**Bảng phụ trợ `ai_conversation_messages`**: `conversation_id FK`,
`role text` (`user`\|`assistant`\|`system`), `content text`,
`created_at timestamptz`.

### 31. `ai_feedback`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `conversation_id` | `uuid` | ✔ | FK → `ai_conversations.id` |
| `message_id` | `uuid` | | FK → `ai_conversation_messages.id` (phản hồi 1 tin nhắn cụ thể) |
| `rating` | `text` | ✔ | `thumbs_up` \| `thumbs_down` |
| `comment` | `text` | | Góp ý thêm |
| `created_by` | `uuid` | | FK → `users.id` (null nếu khách vãng lai) |

**Khóa ngoại**: `conversation_id → ai_conversations.id`;
`message_id → ai_conversation_messages.id`; `created_by → users.id`.
**Index**: `(conversation_id)`.
**Relationship**: nhiều–1 với `ai_conversations`.
**RLS đề xuất**: người tạo feedback + admin/nhân viên phụ trách chất
lượng AI.

### 37. `ai_memory` (mới, Sprint 1 Revision)

**Mục đích**: **trí nhớ dài hạn** của AI về một `customers`/`animals` cụ
thể — tồn tại **xuyên suốt nhiều phiên hội thoại**, khác
`ai_conversation_messages` (chỉ có ý nghĩa trong 1 phiên). Ví dụ: "vật
nuôi này từng dị ứng với sản phẩm X" (ghi nhận từ hội thoại trước, cần
bác sĩ xác nhận trước khi coi là sự thật y tế — xem RLS bên dưới), "khách
hàng này thường hỏi về gia cầm".

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `subject_table` | `text` | ✔ | `customers` hoặc `animals` (polymorphic, whitelist 2 giá trị) |
| `subject_id` | `uuid` | ✔ | |
| `memory_type` | `text` | ✔ | ví dụ `preference`, `known_issue`, `context_note` |
| `content` | `text` | ✔ | Nội dung trí nhớ dạng tự nhiên |
| `importance_score` | `numeric` | | Dùng để ưu tiên khi ngữ cảnh AI có giới hạn độ dài |
| `source_conversation_id` | `uuid` | | FK → `ai_conversations.id` — phiên hội thoại đã sinh ra trí nhớ này |
| `is_verified` | `boolean` | ✔ (default false) | **true chỉ khi nhân viên/bác sĩ xác nhận** — trí nhớ chưa xác minh không được dùng để khẳng định sự thật y tế trong câu trả lời AI |
| `expires_at` | `timestamptz` | | Null = không hết hạn |

**Khóa ngoại**: `source_conversation_id → ai_conversations.id`.
**Index**: `(subject_table, subject_id)`; `(organization_id)`.
**Relationship**: polymorphic tới `customers`/`animals`; nhiều–1 với
`ai_conversations`.
**RLS đề xuất**: đọc bởi nhân viên/bác sĩ/admin có quyền truy cập
`subject_id` tương ứng; **ghi tự động bởi `ai_system`** nhưng
`is_verified` chỉ được set `true` bởi user thật (không cho AI tự xác
minh chính mình) — đúng nguyên tắc "AI không tự bịa dữ liệu y tế".

### 38. `ai_recommendations` (mới, Sprint 1 Revision)

**Mục đích**: đề xuất do AI sinh ra — **luôn ở trạng thái chờ duyệt**
trước khi trở thành hành động thật (nhắc lịch, gợi ý sản phẩm, đề xuất
next-best-action). Bảng này là cơ chế ép buộc ở tầng dữ liệu cho nguyên
tắc "AI gợi ý Next Best Action nhưng không tự quyết định thay bác sĩ".

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `recommendation_type` | `text` | ✔ | `product` \| `next_action` \| `care_plan` \| `reminder` |
| `subject_table` | `text` | ✔ | Đối tượng đề xuất áp dụng (`customers`, `animals`...) |
| `subject_id` | `uuid` | ✔ | |
| `source_conversation_id` | `uuid` | | FK → `ai_conversations.id` |
| `content` | `jsonb` | ✔ | Nội dung đề xuất có cấu trúc (ví dụ `{product_id, reason}`) |
| `confidence_score` | `numeric` | | Điểm tự tin của model (nếu model cung cấp) |
| `status` | `text` | ✔ (default `pending_review`) | `pending_review` \| `accepted` \| `rejected` \| `applied` |
| `reviewed_by` | `uuid` | | FK → `users.id` |
| `reviewed_at` | `timestamptz` | | |

**Khóa ngoại**: `source_conversation_id → ai_conversations.id`;
`reviewed_by → users.id`.
**Index**: `(subject_table, subject_id)`; `(status)`.
**Relationship**: polymorphic; nhiều–1 với `ai_conversations`; khi
`status = 'applied'` có thể sinh ra bản ghi thật ở bảng đích (ví dụ một
`reminders` mới) — việc "áp dụng" luôn do **người** thực hiện thao tác,
không phải trigger tự động từ AI.
**RLS đề xuất**: nhân viên/bác sĩ/admin có quyền trên `subject_id` mới
được xem và duyệt; `ai_system` chỉ được `INSERT` với `status =
'pending_review'`, không được tự đổi sang `accepted`/`applied`.

### 39. `ai_prompt_templates` (mới, Sprint 1 Revision)

**Mục đích**: quản lý phiên bản prompt tập trung — đổi hành vi AI (cách
chào hỏi, cách từ chối chẩn đoán, cách chuyển tiếp bác sĩ...) qua cấu
hình thay vì sửa code.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `code` | `text` | ✔ (unique cùng `version`) | ví dụ `triage_greeting`, `medical_disclaimer`, `handoff_to_doctor` |
| `name` | `text` | ✔ | |
| `purpose` | `text` | | Mô tả mục đích sử dụng |
| `template_content` | `text` | ✔ | Nội dung prompt, có placeholder |
| `variables` | `jsonb` | | Danh sách biến placeholder hợp lệ |
| `version` | `integer` | ✔ (default 1) | |
| `is_active` | `boolean` | ✔ (default true) | Chỉ 1 version `is_active = true` cho mỗi `code` tại một thời điểm |
| `created_by` | `uuid` | | FK → `users.id` |

**Khóa ngoại**: `created_by → users.id`.
**Index**: unique `(code, version)`; `(code, is_active)`.
**Relationship**: được `ai_conversations` tham chiếu (nên lưu
`prompt_template_code` + `prompt_template_version` đã dùng vào
`ai_conversations`/`ai_conversation_messages` khi triển khai thật, để có
thể truy vết chính xác phiên bản prompt nào đã tạo ra một câu trả lời cụ
thể — chi tiết field này bổ sung ở Sprint viết migration, chưa liệt kê
đầy đủ ở Sprint 1).
**RLS đề xuất**: đọc bởi `ai_system` + admin; ghi/sửa chỉ admin có quyền
`ai.manage_prompts`. `organization_id` **nullable** — null nghĩa là
template dùng chung toàn nền tảng.

### 40. `ai_training_data` (mới, Sprint 1 Revision)

**Mục đích**: dữ liệu mẫu **đã xác minh** dùng để đánh giá/tinh chỉnh AI
hoặc làm nguồn RAG — **không bao giờ** tự động nạp hội thoại thô chưa
kiểm duyệt vào bảng này (rủi ro AI tự học lại câu trả lời sai đã từng
đưa ra).

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `source_type` | `text` | ✔ | `conversation` \| `manual` \| `knowledge_article` |
| `source_conversation_id` | `uuid` | | FK → `ai_conversations.id` (nếu trích từ hội thoại thật) |
| `input_text` | `text` | ✔ | Câu hỏi/tình huống đầu vào |
| `expected_output_text` | `text` | ✔ | Câu trả lời đúng đã được xác minh |
| `category` | `text` | | Phân loại chủ đề (dinh dưỡng, vaccine, sản phẩm...) |
| `is_verified` | `boolean` | ✔ (default false) | **Bắt buộc true** trước khi được dùng trong bất kỳ pipeline huấn luyện/đánh giá nào |
| `verified_by` | `uuid` | | FK → `users.id` — phải là bác sĩ/chuyên môn với các category y tế |

**Khóa ngoại**: `source_conversation_id → ai_conversations.id`;
`verified_by → users.id`.
**Index**: `(category)`; `(is_verified)`.
**Relationship**: nhiều–1 với `ai_conversations` (khi có nguồn gốc).
**RLS đề xuất**: chỉ admin/nhân viên có quyền `ai.manage_training_data`
đọc/ghi; **không** cho `ai_system` tự ghi `is_verified = true`.

---

## Cụm 10 — Nền tảng

### 32. `notifications`

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `recipient_user_id` | `uuid` | | FK → `users.id` |
| `recipient_customer_id` | `uuid` | | FK → `customers.id` |
| `channel` | `text` | ✔ | `in_app` \| `email` \| `sms` \| `zalo` \| `push` |
| `title` | `text` | ✔ | |
| `body` | `text` | ✔ | |
| `related_table` | `text` | | Polymorphic — liên kết tới nguồn gây thông báo |
| `related_id` | `uuid` | | |
| `status` | `text` | ✔ | `pending` \| `sent` \| `failed` \| `read` |
| `sent_at` | `timestamptz` | | |
| `read_at` | `timestamptz` | | |

**Khóa ngoại**: `recipient_user_id → users.id`;
`recipient_customer_id → customers.id`.
**Index**: `(recipient_user_id, status)`; `(recipient_customer_id, status)`.
**Relationship**: thường được sinh ra từ `reminders`; polymorphic tới
nguồn gây thông báo.
**RLS đề xuất**: chỉ người nhận đọc được; hệ thống (service role) tạo.

### 33. `settings`

**Mục đích**: cấu hình dạng key-value — dùng cho cấu hình toàn nền tảng,
theo từng tổ chức (`organizations`), hoặc theo từng user.
**Cập nhật Sprint 1 Revision**: phạm vi `dealer` (Sprint 1 gốc) được thay
bằng `organization`, dùng trực tiếp cột chuẩn `organization_id` thay vì
`scope_id` riêng — nhất quán với cách mọi bảng khác xác định tenant.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `scope` | `text` | ✔ | `global` \| `organization` \| `user` |
| `scope_id` | `uuid` | | Chỉ dùng khi `scope = 'user'` (trỏ `users.id`); khi `scope = 'organization'` dùng cột `organization_id` chuẩn, không lặp lại ở đây; null nếu `scope = 'global'` |
| `key` | `text` | ✔ | |
| `value` | `jsonb` | ✔ | |
| `updated_by` | `uuid` | | FK → `users.id` |

**Khóa ngoại**: `updated_by → users.id`; `scope_id → users.id` (chỉ khi
`scope = 'user'`).
**Index**: unique `(organization_id, scope, scope_id, key)`.
**Relationship**: không ràng buộc cứng tới bảng khác (theo thiết kế
key-value tổng quát).
**RLS đề xuất**: `global` (`organization_id` null) chỉ `super_admin` sửa,
mọi authenticated đọc được cấu hình public; `organization` chỉ
admin/super_admin của tổ chức đó; `user` chỉ chính user đó + admin.

### 34. `audit_logs`

**Mục đích**: nhật ký thay đổi cấp thấp phục vụ tuân thủ/truy vết — append
only, không sửa/xoá.

| Trường | Kiểu | Bắt buộc | Mô tả |
| --- | --- | --- | --- |
| `table_name` | `text` | ✔ | |
| `record_id` | `uuid` | ✔ | |
| `action` | `text` | ✔ | `insert` \| `update` \| `delete` |
| `changed_by` | `uuid` | | FK → `users.id` (null nếu hệ thống) |
| `old_values` | `jsonb` | | |
| `new_values` | `jsonb` | | |

**Khóa ngoại**: `changed_by → users.id`.
**Index**: `(table_name, record_id, created_at desc)`.
**Relationship**: polymorphic tới mọi bảng cần audit (đặc biệt
`prescriptions`, `treatments`, `invoices`, `users`, `settings`).
**RLS đề xuất**: chỉ admin đọc; **chỉ ghi qua trigger hệ thống, không ai
được ghi trực tiếp** (kể cả admin) — đảm bảo tính toàn vẹn của nhật ký.

---

## Bảng tổng hợp khóa ngoại (tra cứu nhanh)

| Bảng | Khóa ngoại chính |
| --- | --- |
| **Mọi bảng nghiệp vụ (trừ ngoại lệ đã liệt kê)** | **→ `organizations` qua `organization_id`** |
| `organizations` | → `organizations` (self, `parent_organization_id`) |
| `user_roles`, `role_permissions` | → `users`, `roles`, `permissions` |
| `doctors`, `employees`, `dealers` | → `users` |
| `customers` | → `users`, `dealers`, `communes` |
| `farms` | → `customers`, `communes` |
| `animals` | → `customers`, `farms`, `species`, `breeds` |
| `breeds` | → `species` |
| `districts` | → `provinces`; `communes` → `districts` |
| `products` | → `product_categories` |
| `inventory`, `purchase_order_items`, `sales_order_items`, `prescription_items`, `vaccinations` | → `products` |
| `purchase_orders` | → `suppliers` |
| `sales_orders` | → `customers`, `dealers` |
| `invoices` | → `sales_orders`, `customers` |
| `appointments` | → `customers`, `animals`, `doctors`, `employees` |
| `treatments` | → `animals`, `doctors`, `appointments` |
| `prescriptions` | → `treatments`, `doctors`, `animals` |
| `ai_conversations` | → `customers`, `users`, `doctors` |
| `ai_feedback` | → `ai_conversations`, `ai_conversation_messages` |
| `ai_memory`, `ai_recommendations`, `ai_training_data` | → `ai_conversations` |
| `notifications` | → `users`, `customers` |
| (polymorphic — không FK cứng) | `attachments`, `notes`, `activities`, `events`, `reminders`, `ai_memory`, `ai_recommendations`, `audit_logs` |

## Tổng số bảng

**40 bảng nghiệp vụ** (34 gốc + `organizations`, `events`, `ai_memory`,
`ai_recommendations`, `ai_prompt_templates`, `ai_training_data`) **+ 6
bảng phụ trợ** (`user_roles`, `role_permissions`,
`purchase_order_items`, `sales_order_items`, `prescription_items`,
`ai_conversation_messages`) **= 46 bảng vật lý**.

## File liên quan

- Nguyên tắc thiết kế & ERD: [`11_DATABASE_ARCHITECTURE.md`](./11_DATABASE_ARCHITECTURE.md)
- Chiến lược RLS chi tiết theo vai trò: [`13_RLS_POLICY_PLAN.md`](./13_RLS_POLICY_PLAN.md)
- Kế hoạch Storage cho `attachments`: [`14_STORAGE_PLAN.md`](./14_STORAGE_PLAN.md)
