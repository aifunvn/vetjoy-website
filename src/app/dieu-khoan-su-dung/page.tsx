import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description: `Điều khoản sử dụng website ${siteConfig.brandName}.`,
  alternates: { canonical: "/dieu-khoan-su-dung" },
  robots: { index: false, follow: true },
};

export default function TermsOfUsePage() {
  return (
    <Container className="max-w-2xl py-12">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
        Điều khoản sử dụng
      </h1>

      <div className="mt-8 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-600">
        <p className="font-semibold text-neutral-700">
          PLACEHOLDER — CẦN FOUNDER PHÊ DUYỆT
        </p>
        <p className="mt-2">
          Nội dung điều khoản sử dụng chi tiết (phạm vi dịch vụ, trách nhiệm các bên,
          giới hạn trách nhiệm, quyền sở hữu trí tuệ, luật áp dụng...) cần được
          Founder và/hoặc bộ phận pháp lý của {siteConfig.companyName} soạn thảo và
          phê duyệt trước khi công bố chính thức.
        </p>
      </div>

      <div className="mt-6 space-y-4 text-sm text-neutral-600">
        <p>
          Nội dung trên website VETJOY (bao gồm bài viết kiến thức và thông tin sản
          phẩm mẫu) chỉ mang tính chất tham khảo, không thay thế cho việc thăm khám
          và tư vấn trực tiếp từ bác sĩ thú y.
        </p>
      </div>
    </Container>
  );
}
