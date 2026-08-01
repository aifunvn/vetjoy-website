import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Về VETJOY",
  description: `Câu chuyện thương hiệu ${siteConfig.brandName} — ${siteConfig.companyName}.`,
  alternates: { canonical: "/ve-vetjoy" },
};

export default function AboutPage() {
  return (
    <Container className="max-w-3xl py-12">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Về VETJOY</h1>

      <div className="prose prose-neutral mt-8 max-w-none space-y-4 text-neutral-700">
        <p>
          VETJOY được phát triển từ kinh nghiệm thực tế trong ngành thú y. Qua quá
          trình làm việc với người chăn nuôi, một vấn đề rõ ràng xuất hiện: khách
          hàng không chỉ cần sản phẩm.
        </p>
        <p>Họ cần biết:</p>
        <ul className="list-disc space-y-1 pl-6">
          <li>Dùng gì?</li>
          <li>Tại sao?</li>
          <li>Dùng thế nào?</li>
          <li>Theo dõi ra sao?</li>
          <li>Và phải làm gì tiếp theo?</li>
        </ul>
        <p>VETJOY được xây dựng để kết hợp:</p>
        <p className="font-semibold text-brand-green-700">
          Chuyên môn + Sản phẩm + Công nghệ + Dữ liệu.
        </p>
      </div>

      <div className="mt-10 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500">
        <p className="font-semibold text-neutral-600">PLACEHOLDER</p>
        <p className="mt-1">
          Thông tin lịch sử thành lập, quy mô công ty, giấy phép kinh doanh và các cột
          mốc phát triển của {siteConfig.companyName} cần được Founder cung cấp và
          xác nhận trước khi bổ sung vào trang này.
        </p>
      </div>
    </Container>
  );
}
