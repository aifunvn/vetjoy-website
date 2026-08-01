import type { Testimonial, FaqItem } from "@/types";

/**
 * DỮ LIỆU MẪU – CẦN THAY BẰNG DỮ LIỆU ĐÃ XÁC MINH.
 * Không sử dụng để quảng bá cho đến khi có xác nhận từ khách hàng thật.
 */
export const testimonials: Testimonial[] = [
  {
    isDemo: true,
    id: "demo-1",
    authorName: "[Mẫu] Anh Nguyễn Văn A",
    authorRole: "Chủ trang trại chăn nuôi",
    quote:
      "Đây là nội dung đánh giá mẫu minh họa vị trí hiển thị testimonial trên giao diện.",
    location: "PLACEHOLDER",
  },
  {
    isDemo: true,
    id: "demo-2",
    authorName: "[Mẫu] Chị Trần Thị B",
    authorRole: "Người nuôi thú cưng",
    quote:
      "Đây là nội dung đánh giá mẫu minh họa vị trí hiển thị testimonial trên giao diện.",
    location: "PLACEHOLDER",
  },
  {
    isDemo: true,
    id: "demo-3",
    authorName: "[Mẫu] Anh Lê Văn C",
    authorRole: "Chủ đại lý thú y",
    quote:
      "Đây là nội dung đánh giá mẫu minh họa vị trí hiển thị testimonial trên giao diện.",
    location: "PLACEHOLDER",
  },
];

export const homeFaqs: FaqItem[] = [
  {
    question: "VETJOY có phải là cửa hàng bán thuốc thú y thông thường không?",
    answer:
      "Không. VETJOY là hệ sinh thái chăm sóc sức khỏe vật nuôi, kết hợp sản phẩm, tư vấn chuyên môn từ bác sĩ thú y và công nghệ theo dõi (VETJOY App) để đồng hành cùng bạn lâu dài.",
  },
  {
    question: "Tôi cần cung cấp gì khi gửi yêu cầu tư vấn?",
    answer:
      "Bạn chỉ cần mô tả tình trạng vật nuôi hiện tại và thông tin liên hệ. Đội ngũ VETJOY sẽ xem xét và phản hồi sớm nhất có thể.",
  },
  {
    question: "VETJOY App đã sử dụng được chưa?",
    answer:
      "VETJOY App đang trong quá trình phát triển. Bạn có thể đăng ký nhận thông báo khi ra mắt tại trang VETJOY App.",
  },
];
