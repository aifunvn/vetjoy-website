import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description: `Chính sách bảo mật của ${siteConfig.brandName}.`,
  alternates: { canonical: "/chinh-sach-bao-mat" },
  robots: { index: false, follow: true },
};

export default function PrivacyPolicyPage() {
  return (
    <Container className="max-w-2xl py-12">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
        Chính sách bảo mật
      </h1>

      <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600">
        <p className="font-semibold text-neutral-700">
          PLACEHOLDER — CẦN FOUNDER PHÊ DUYỆT
        </p>
        <p className="mt-2">
          Nội dung chính sách bảo mật chi tiết (loại dữ liệu thu thập, mục đích sử
          dụng, thời gian lưu trữ, quyền của khách hàng, đơn vị chịu trách nhiệm...)
          cần được Founder và/hoặc bộ phận pháp lý của {siteConfig.companyName} soạn
          thảo và phê duyệt trước khi công bố chính thức.
        </p>
      </div>

      <div className="mt-6 space-y-4 text-sm text-neutral-600">
        <p>
          VETJOY cam kết chỉ sử dụng thông tin khách hàng cung cấp qua các biểu mẫu
          trên website (tư vấn, đăng ký đại lý, liên hệ) nhằm mục đích liên hệ và hỗ
          trợ yêu cầu tương ứng.
        </p>
        <p>
          Chúng tôi không lưu trữ thông tin thẻ ngân hàng, mật khẩu hoặc các dữ liệu
          nhạy cảm khác trên website này.
        </p>
      </div>
    </Container>
  );
}
