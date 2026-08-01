# 01. Tổng quan dự án

## Dự án là gì

VETJOY Website là website Phase 1 (đã nâng cấp lên Phase 1.5 về giao diện)
cho **Công ty Thú y Chung Lương**, thương hiệu **VETJOY**. Đây là một ứng
dụng **Next.js 16 (App Router)** production-ready, chạy độc lập ở
**demo mode** (không cần backend thật) và được thiết kế để mở rộng dần
thành một hệ sinh thái số cho ngành thú y — không chỉ là một website giới
thiệu công ty.

## Mục tiêu dự án

Mục tiêu số 1 của website: **thu lead chất lượng**. Cụ thể website phải
giúp khách truy cập:

1. Hiểu VETJOY là ai trong vài giây đầu (Hero).
2. Tìm đúng giải pháp theo vấn đề họ đang gặp (Giải pháp / Solutions).
3. Tìm sản phẩm phù hợp (Sản phẩm / Product Library).
4. Gửi yêu cầu tư vấn cho bác sĩ thú y (form Tư vấn bác sĩ).
5. Gửi thông tin đăng ký làm đại lý (form Đại lý).
6. Tin tưởng VETJOY nhờ nội dung chuyên môn (Kiến thức, Đội ngũ chuyên môn).
7. Biết về định hướng công nghệ dài hạn (VETJOY App).

Không phải mục tiêu của Phase 1: bán hàng trực tiếp (e-commerce), thanh
toán online, hay thay thế vai trò tư vấn của bác sĩ thú y bằng AI.

## Giá trị cốt lõi (Core value proposition)

VETJOY định vị là **hệ sinh thái chăm sóc sức khỏe vật nuôi**, không chỉ
là nơi bán thuốc thú y. Giá trị cốt lõi được lặp lại xuyên suốt sản phẩm:

> Chuyên môn (bác sĩ thú y trên 20 năm kinh nghiệm) + Sản phẩm + Công nghệ
> (VETJOY App) + Dữ liệu (hồ sơ vật nuôi) = chăm sóc liên tục, không dừng
> lại sau khi bán.

Phương pháp làm việc được chuẩn hoá thành khung **VETJOY CARE 5**, xuất
hiện trên trang chủ và định hình cách mọi trang giải pháp được viết:

1. **Ghi nhận** — ghi nhận tình trạng vật nuôi.
2. **Đánh giá** — đánh giá vấn đề đang gặp phải.
3. **Giải pháp** — đề xuất giải pháp phù hợp.
4. **Theo dõi** — theo dõi quá trình thực hiện.
5. **Chăm sóc tiếp** — nhắc lịch và chăm sóc tiếp theo.

## Khách hàng mục tiêu (Personas)

| Persona | Nhu cầu chính |
| --- | --- |
| Người chăn nuôi gia súc | Phòng bệnh, vaccine, dinh dưỡng cho đàn gia súc |
| Người chăn nuôi gia cầm | Phòng bệnh, vaccine, an toàn sinh học cho đàn gia cầm |
| Chủ trang trại | Quản lý sức khỏe đàn ở quy mô lớn, quy trình bài bản |
| Người nuôi chó, mèo | Chăm sóc sức khỏe, vaccine, sản phẩm cho thú cưng |
| Đại lý / cửa hàng thú y | Tìm cơ hội hợp tác phân phối sản phẩm VETJOY |

Vấn đề chung của các persona này (đã ghi nhận trong brief sản phẩm gốc):
không biết vật nuôi đang gặp vấn đề gì, không biết dùng sản phẩm nào,
quên lịch vaccine, thiếu kế hoạch phòng bệnh, không có nơi lưu lịch sử
sức khỏe vật nuôi, và không biết hỏi ai khi phát sinh vấn đề. Website
được thiết kế để giải quyết trực tiếp từng điểm này qua Solutions,
Consultation form và định hướng VETJOY App.

## Kiến trúc tổng quan

- **Frontend + rendering**: Next.js 16 (App Router, Turbopack), React 19,
  TypeScript strict.
- **Styling**: Tailwind CSS v4, design token khai báo tập trung trong
  `src/app/globals.css`.
- **Dữ liệu**: chạy hoàn toàn ở **demo mode** — nội dung sản phẩm/bài
  viết/giải pháp là dữ liệu mẫu (`src/data/`), lead được lưu tạm trong bộ
  nhớ server (`DemoLeadRepository`). Không có cơ sở dữ liệu thật nào được
  kết nối ở Phase 1.
- **Kiến trúc seam cho tương lai**: mọi nơi đọc/ghi dữ liệu đều đi qua một
  lớp `services/` (interface `LeadRepository`, các hàm `*-service.ts`) —
  đây là điểm để cắm Supabase/CRM/AI sau này mà không phải viết lại UI.
  Xem chi tiết ở [`02_ARCHITECTURE.md`](./02_ARCHITECTURE.md).

## Roadmap tổng quan

| Giai đoạn | Trạng thái | Nội dung |
| --- | --- | --- |
| Phase 1 | ✅ Hoàn thành | Toàn bộ trang, form thu lead, SEO, a11y, demo data, test, build |
| Phase 1.5 | ✅ Hoàn thành | Nâng cấp giao diện: Hero, Why VETJOY, timeline, icon hệ thống, Footer, Floating Action Button |
| Phase 1.6 (tài liệu hoá) | ✅ Đang thực hiện | Bộ tài liệu kỹ thuật trong `/docs` để bàn giao |
| Phase 2 | 🔜 Chưa bắt đầu | Supabase, CRM, VETJOY App thật, AI Assistant, Automation — xem [`09_PHASE2_PLAN.md`](./09_PHASE2_PLAN.md) |

## Tài liệu liên quan

- Kiến trúc kỹ thuật chi tiết: [`02_ARCHITECTURE.md`](./02_ARCHITECTURE.md)
- Cấu trúc thư mục: [`03_FOLDER_STRUCTURE.md`](./03_FOLDER_STRUCTURE.md)
- Nội dung nào là dữ liệu mẫu / cần Founder thay: [`06_CONTENT_GUIDE.md`](./06_CONTENT_GUIDE.md)
- Lịch sử thay đổi: [`10_CHANGELOG.md`](./10_CHANGELOG.md)
