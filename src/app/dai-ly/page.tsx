import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { DealerForm } from "@/features/dealer/DealerForm";

export const metadata: Metadata = {
  title: "Dành cho đại lý",
  description:
    "Trở thành đối tác VETJOY — dành cho đại lý, cửa hàng thú y, nhà phân phối và đối tác ngành chăn nuôi.",
  alternates: { canonical: "/dai-ly" },
};

const audiences = ["Đại lý", "Cửa hàng thú y", "Nhà phân phối", "Đối tác ngành chăn nuôi"];

export default function DealerPage() {
  return (
    <Container className="max-w-2xl py-12">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
        TRỞ THÀNH ĐỐI TÁC VETJOY
      </h1>
      <p className="mt-3 text-neutral-600">
        VETJOY tìm kiếm đối tác đồng hành lâu dài để cùng mang giải pháp chăm sóc vật
        nuôi đến gần hơn với người chăn nuôi.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {audiences.map((a) => (
          <span
            key={a}
            className="rounded-full bg-brand-green-50 px-3 py-1 text-xs font-semibold text-brand-green-700"
          >
            {a}
          </span>
        ))}
      </div>

      <div className="mt-8">
        <DealerForm />
      </div>
    </Container>
  );
}
