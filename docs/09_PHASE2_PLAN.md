# 09. Kế hoạch Phase 2 (đề xuất)

> Tài liệu này là **đề xuất kỹ thuật**, chưa phải cam kết lịch trình. Mọi
> mốc thời gian, chi phí dịch vụ (Supabase, AI API...) và thứ tự ưu tiên
> cần Founder duyệt trước khi bắt đầu — đặc biệt các hạng mục phát sinh
> chi phí vận hành định kỳ.

## Nguyên tắc xuyên suốt Phase 2

Toàn bộ Phase 1 đã cố tình chuẩn bị sẵn "đường ống" (seam) để Phase 2 cắm
vào mà không phải viết lại UI — nguyên tắc khi triển khai Phase 2 vẫn giữ
nguyên: **thay implementation, không thay interface**. Ví dụ:
`LeadRepository` interface không đổi, chỉ thêm `SupabaseLeadRepository`
implementation mới.

```
Website (Phase 1, đã xong)
   ↓
Lead Database (Phase 2.1)
   ↓
CRM (Phase 2.2) → Customer / Animal Profile
   ↓
Business Core Management — BCM (Phase 2.3)
   ↓
AI Assistant / Chat AI (Phase 2.4)
   ↓
Automation (Phase 2.5)
   ↓
VETJOY App thật (Phase 2.6, song song hoặc sau)
```

---

## Phase 2.1 — Supabase (nền tảng dữ liệu)

**Mục tiêu**: thay `DemoLeadRepository` bằng lưu trữ thật, không mất lead
khi restart server.

Việc cần làm:
1. Founder tạo project Supabase (quyết định chi phí — cần duyệt trước).
2. Review & áp dụng `supabase/migrations/0001_init.sql` (đã có sẵn trong
   repo, chưa chạy) — bảng `leads` với `lead_type`, `details` (JSONB cho
   field riêng theo từng loại lead), attribution UTM, RLS bật sẵn.
3. Thêm dependency `@supabase/supabase-js` (dependency **duy nhất** cần
   thêm cho hạng mục này).
4. Viết `src/services/supabase-lead-repository.ts` implement
   `LeadRepository`, dùng Supabase server client với
   `SUPABASE_SERVICE_ROLE_KEY` (chỉ đọc ở server, không bao giờ lộ ra
   client).
5. Sửa `get-lead-repository.ts` để chọn implementation theo biến môi
   trường — **đây là điểm sửa duy nhất**, không đụng vào form/UI.
6. (Tuỳ chọn) Chuyển `src/data/*.ts` (sản phẩm/bài viết/giải pháp) sang
   bảng Supabase tương ứng nếu muốn Founder tự cập nhật nội dung mà không
   cần dev sửa code — xem Phase 2.2 (CMS).

**Rủi ro cần lưu ý**: RLS (Row Level Security) đã bật sẵn trong migration
đề xuất, không có policy public nào — nếu thêm policy, phải giới hạn đúng
phạm vi (ví dụ chỉ cho phép `insert` từ service role, không cho `select`
công khai để tránh lộ thông tin khách hàng).

## Phase 2.2 — CMS (quản trị nội dung)

**Mục tiêu**: Founder/nhân viên tự cập nhật sản phẩm, bài viết, giải pháp,
testimonial mà không cần dev sửa code trực tiếp trong `src/data/`.

Lựa chọn cần Founder quyết định (đánh đổi chi phí ↔ mức độ tuỳ biến):
- **CMS có sẵn** (Sanity, Payload, Strapi...) — nhanh, nhưng thêm
  dependency/chi phí hosting riêng.
- **Tự xây trên Supabase** (bảng `products`, `articles`, `solutions`,
  `testimonials` + trang quản trị nội bộ đơn giản) — tận dụng hạ tầng đã
  có ở Phase 2.1, không thêm dịch vụ ngoài.

Dù chọn hướng nào, **service layer hiện tại** (`product-service.ts`,
`article-service.ts`, `solution-service.ts`) đã được thiết kế để chỉ cần
đổi phần thân hàm — trang hiển thị (`page.tsx`) không cần sửa.

## Phase 2.3 — CRM & Business Core Management (BCM)

**Mục tiêu**: biến lead thành khách hàng có hồ sơ theo dõi lâu dài.

```
Lead → Customer → Animal/Herd Profile → Consultation history
     → Product usage history → Follow-up → Vaccine/Reminder → Outcome
```

- Data model `Lead` (`src/types/lead.ts`) đã có sẵn `leadType`, thông tin
  liên hệ, UTM — là điểm bắt đầu tự nhiên cho bảng `customers` trong CRM.
- **Business Core Management (BCM)**: theo định hướng gốc của dự án,
  `src/config/site.ts` hiện đóng vai trò "Business Core" tối giản (brand
  identity, contact, nav). Phase 2 có thể mở rộng thành một nguồn dữ liệu
  tập trung hơn (Persona, Insight, Journey, Messaging, Objection, FAQ,
  Proof, Brand Voice) mà Website, CRM, Content System và AI Agent cùng
  đọc — tránh mỗi hệ thống tự định nghĩa lại thông tin thương hiệu.
- Không cần xây BCM Admin đầy đủ ngay — chỉ cần không thiết kế CRM theo
  cách khiến việc kết nối BCM sau này khó khăn (ví dụ: đừng hard-code lại
  brand voice/nav trong CRM, luôn tham chiếu về một nguồn).

## Phase 2.4 — AI Assistant / Chat AI

**Mục tiêu**: "Hỏi VETJOY AI" — trợ lý tra cứu, không thay thế bác sĩ.

**Phạm vi AI được phép làm**:
- Tra cứu Knowledge Base đã xuất bản (không phải dữ liệu mẫu).
- Tra cứu thông tin sản phẩm đã xác minh.
- Thu thập thông tin lead (tái sử dụng `ConsultationLead` schema).
- Hướng dẫn quy trình (ví dụ: "muốn tư vấn cần chuẩn bị gì").
- Gợi ý Next Best Action (ví dụ: dẫn tới đúng trang Giải pháp).
- Chuyển tiếp cho bác sĩ thật khi vượt phạm vi.

**AI KHÔNG được phép tự bịa** (yêu cầu bắt buộc từ brief gốc, áp dụng cả
ở Phase 2): chẩn đoán, liều dùng, chỉ định/chống chỉ định, giá, công
dụng, chứng nhận, case study, kết quả điều trị — khi dữ liệu chưa được
xác minh. Cần thiết kế prompt/guardrail chặn các loại output này, và luôn
gắn nguồn dữ liệu (Knowledge Base) cho câu trả lời có thể tra cứu được.

Việc cần làm về hạ tầng:
1. Founder duyệt nhà cung cấp LLM/API Gateway (phát sinh chi phí — cần
   duyệt trước khi tích hợp bất kỳ model thật nào).
2. Xây tầng RAG (retrieval) trên Knowledge Base thật (sau khi có ở Phase
   2.2), không cho AI trả lời tự do ngoài phạm vi dữ liệu đã xác minh.
3. Route mới `/hoi-vetjoy-ai` hoặc widget chat — tái sử dụng
   `FloatingActionButton` làm điểm vào (đã có sẵn UI mở rộng menu nhanh).
4. Log hội thoại có thể trở thành một loại "lead" mới trong hệ thống lead
   hiện có (`leadType` đã là enum mở rộng được).

## Phase 2.5 — Automation

**Mục tiêu**: tự động hoá luồng Lead → CRM → chăm sóc, giảm thao tác thủ
công.

```
Website → Lead → CRM → Automation → Zalo/Email → Nhân viên
```

Ví dụ luồng cụ thể (cần Founder xác nhận công cụ trước khi build):
- Lead mới submit → tự động gửi Zalo/email xác nhận đã nhận yêu cầu.
- Lead loại `veterinary_consultation` → tự động gán cho nhân viên trực
  theo lịch.
- Sau X ngày không có `status` cập nhật → nhắc nhở nhân viên follow-up.
- Lead loại `dealer` → tự động thêm vào pipeline đối tác riêng.

Không cần triển khai toàn bộ automation ngay — ưu tiên luồng nào ảnh
hưởng trực tiếp tới tỷ lệ chuyển đổi lead trước (thường là auto-reply +
gán nhân viên).

## Phase 2.6 — VETJOY App (ứng dụng thật)

Trang `/vetjoy-app` hiện là "SẮP RA MẮT" với danh sách 10 chức năng định
hướng (hồ sơ vật nuôi, lịch vaccine, nhắc lịch, nhật ký sức khỏe, lịch sử
sản phẩm, theo dõi chăm sóc, lưu hình ảnh, kết nối tư vấn, theo dõi sau
điều trị — xem `app/vetjoy-app/page.tsx`). Khi App thật được xây (có thể
là dự án riêng, không nhất thiết chung repo này), Website chỉ cần:
- Đổi badge "SẮP RA MẮT" thành link tải app thật.
- Trỏ App vào cùng bảng `customers`/`animals` trong Supabase (Phase 2.1)
  để dữ liệu web và app đồng bộ.

## Phase 2.7 — Analytics thật

`src/lib/analytics.ts` đã định nghĩa đủ danh sách event cần theo dõi
(`cta_consult_click`, `consultation_submit`, `product_view`,
`product_consult_click`, `dealer_submit`, `article_view`, `app_interest`,
`phone_click`, `zalo_click`) và đã gắn `track()` vào đúng vị trí trên UI
— hiện chỉ log ra console (dev mode). Việc cần làm: Founder chọn nhà cung
cấp analytics (Google Analytics, Plausible, PostHog...) → thay phần thân
hàm `track()` bằng lệnh gọi SDK thật. Không cần sửa bất kỳ component nào
khác vì mọi nơi đã gọi qua `track()`.

## Gợi ý thứ tự ưu tiên

1. **Supabase (2.1)** — bắt buộc trước mọi hạng mục khác, vì mọi thứ sau
   đều cần lưu trữ thật.
2. **Analytics thật (2.7)** — chi phí thấp, triển khai nhanh, có dữ liệu
   sớm để ra quyết định cho các phase sau.
3. **CMS (2.2)** — giảm phụ thuộc vào dev cho việc cập nhật nội dung.
4. **Automation cơ bản (2.5)** — tăng tỷ lệ chuyển đổi lead ngay.
5. **CRM/BCM (2.3)** — khi khối lượng lead đủ lớn để cần quản lý bài bản.
6. **AI Assistant (2.4)** và **VETJOY App (2.6)** — đầu tư dài hạn, nên
   làm sau khi có dữ liệu thật (Knowledge Base, sản phẩm, khách hàng) đủ
   phong phú để không bị giới hạn bởi thiếu nội dung xác minh.
