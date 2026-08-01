import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SolutionCard } from "@/components/solutions/SolutionCard";
import { listSolutions } from "@/services/solution-service";

export const metadata: Metadata = {
  title: "Giải pháp",
  description:
    "Tìm giải pháp VETJOY phù hợp theo nhu cầu thực tế của bạn: vật nuôi có vấn đề, phòng bệnh, vaccine, dinh dưỡng, an toàn sinh học, chăm sóc thú cưng và quản lý trang trại.",
  alternates: { canonical: "/giai-phap" },
};

export default async function SolutionsPage() {
  const solutions = await listSolutions();

  return (
    <Container className="py-12">
      <SectionHeading
        align="left"
        eyebrow="Giải pháp VETJOY"
        title="TÌM GIẢI PHÁP THEO NHU CẦU CỦA BẠN"
        description="Chọn đúng vấn đề bạn đang gặp phải để xem hướng tiếp cận của VETJOY."
      />
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {solutions.map((solution) => (
          <SolutionCard key={solution.slug} solution={solution} />
        ))}
      </div>
    </Container>
  );
}
