import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { WhyVetjoySection } from "@/components/home/WhyVetjoySection";
import { ProblemSection } from "@/components/home/ProblemSection";
import { CareFramework } from "@/components/home/CareFramework";
import { ProductCategoriesSection } from "@/components/home/ProductCategoriesSection";
import { ExpertSection } from "@/components/home/ExpertSection";
import { AppTeaserSection } from "@/components/home/AppTeaserSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { KnowledgePreviewSection } from "@/components/home/KnowledgePreviewSection";
import { FinalCta } from "@/components/home/FinalCta";
import { listProductCategories } from "@/services/product-service";
import { listArticles } from "@/services/article-service";
import { testimonials } from "@/data/testimonials";

export const metadata: Metadata = {
  title: "Trang chủ",
  description:
    "VETJOY – hệ sinh thái chăm sóc sức khỏe vật nuôi kết hợp sản phẩm thú y, bác sĩ trên 20 năm kinh nghiệm và công nghệ theo dõi.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [categories, articles] = await Promise.all([
    listProductCategories(),
    listArticles(),
  ]);

  return (
    <>
      <Hero />
      <TrustBar />
      <WhyVetjoySection />
      <ProblemSection />
      <CareFramework />
      <ProductCategoriesSection categories={categories} />
      <ExpertSection />
      <AppTeaserSection />
      <TestimonialsSection testimonials={testimonials} />
      <KnowledgePreviewSection articles={articles.slice(0, 3)} />
      <FinalCta />
    </>
  );
}
