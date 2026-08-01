import type { Article } from "@/types";

/**
 * DỮ LIỆU MẪU — bài viết minh họa cấu trúc Knowledge Hub.
 * Nội dung chuyên môn thật (phác đồ, khuyến nghị kỹ thuật...) cần được
 * bác sĩ thú y của VETJOY biên soạn và xác minh trước khi xuất bản.
 */
export const articles: Article[] = [
  {
    isDemo: true,
    slug: "mau-dau-hieu-nhan-biet-vat-nuoi-bat-thuong",
    title: "[Mẫu] Dấu hiệu nhận biết vật nuôi có biểu hiện bất thường",
    category: "kinh-nghiem-chan-nuoi",
    excerpt:
      "Bài viết mẫu minh họa cấu trúc Knowledge Hub. Nội dung chi tiết sẽ được bác sĩ thú y VETJOY biên soạn.",
    content: [
      "Đây là nội dung mẫu (DỮ LIỆU MẪU) nhằm minh họa bố cục trang chi tiết bài viết.",
      "Nội dung chuyên môn thật sẽ được đội ngũ bác sĩ thú y VETJOY biên soạn và xác minh trước khi đăng tải chính thức.",
    ],
    publishedAt: "2026-01-15",
    readingMinutes: 4,
    coverImagePlaceholder: "/images/articles/placeholder-1.svg",
  },
  {
    isDemo: true,
    slug: "mau-lich-vaccine-can-luu-y",
    title: "[Mẫu] Lịch vaccine cần lưu ý theo từng giai đoạn",
    category: "vaccine",
    excerpt: "Bài viết mẫu về tầm quan trọng của việc theo dõi lịch vaccine.",
    content: [
      "Đây là nội dung mẫu (DỮ LIỆU MẪU) nhằm minh họa bố cục trang chi tiết bài viết.",
      "Lịch vaccine cụ thể theo loại vật nuôi sẽ được VETJOY cập nhật sau khi có dữ liệu xác minh.",
    ],
    publishedAt: "2026-01-20",
    readingMinutes: 5,
    coverImagePlaceholder: "/images/articles/placeholder-2.svg",
  },
  {
    isDemo: true,
    slug: "mau-nguyen-tac-dinh-duong-co-ban",
    title: "[Mẫu] Nguyên tắc dinh dưỡng cơ bản cho vật nuôi",
    category: "dinh-duong",
    excerpt: "Bài viết mẫu giới thiệu các nguyên tắc dinh dưỡng chung.",
    content: [
      "Đây là nội dung mẫu (DỮ LIỆU MẪU) nhằm minh họa bố cục trang chi tiết bài viết.",
      "Khuyến nghị dinh dưỡng cụ thể sẽ được VETJOY biên soạn dựa trên dữ liệu chuyên môn đã xác minh.",
    ],
    publishedAt: "2026-01-25",
    readingMinutes: 4,
    coverImagePlaceholder: "/images/articles/placeholder-3.svg",
  },
  {
    isDemo: true,
    slug: "mau-an-toan-sinh-hoc-chuong-trai",
    title: "[Mẫu] Vì sao an toàn sinh học quan trọng với trang trại",
    category: "an-toan-sinh-hoc",
    excerpt: "Bài viết mẫu về vai trò của an toàn sinh học trong chăn nuôi.",
    content: [
      "Đây là nội dung mẫu (DỮ LIỆU MẪU) nhằm minh họa bố cục trang chi tiết bài viết.",
      "Quy trình an toàn sinh học chi tiết sẽ được VETJOY tư vấn theo từng điều kiện trang trại cụ thể.",
    ],
    publishedAt: "2026-02-01",
    readingMinutes: 6,
    coverImagePlaceholder: "/images/articles/placeholder-4.svg",
  },
];
