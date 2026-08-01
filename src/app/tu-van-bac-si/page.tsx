import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { ConsultationForm } from "@/features/consultation/ConsultationForm";

export const metadata: Metadata = {
  title: "Tư vấn bác sĩ",
  description:
    "Gửi tình trạng vật nuôi để VETJOY hiểu rõ hơn trước khi tư vấn hướng xử lý phù hợp.",
  alternates: { canonical: "/tu-van-bac-si" },
};

export default function ConsultationPage() {
  return (
    <Container className="max-w-2xl py-12">
      <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
        VẬT NUÔI ĐANG CÓ VẤN ĐỀ?
      </h1>
      <p className="mt-3 text-neutral-600">
        Hãy cung cấp một số thông tin để VETJOY hiểu tình trạng trước khi tư vấn.
      </p>
      <div className="mt-8">
        <ConsultationForm />
      </div>
    </Container>
  );
}
