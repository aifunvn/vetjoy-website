import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StateNotice } from "@/components/ui/StateNotice";
import { ArticleCard } from "@/components/knowledge/ArticleCard";
import { KnowledgeFilters } from "@/components/knowledge/KnowledgeFilters";
import { listArticleCategories, listArticles } from "@/services/article-service";
import type { ArticleCategorySlug } from "@/types";

export const metadata: Metadata = {
  title: "Kiến thức thú y",
  description:
    "Knowledge Hub của VETJOY: kiến thức chăn nuôi, phòng bệnh, vaccine, dinh dưỡng và an toàn sinh học.",
  alternates: { canonical: "/kien-thuc" },
};

interface SearchParams {
  category?: string;
  q?: string;
}

export default async function KnowledgeHubPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category = "", q = "" } = await searchParams;
  const [allArticles, categories] = await Promise.all([
    listArticles(),
    listArticleCategories(),
  ]);

  const filtered = allArticles.filter((a) => {
    const matchesCategory = category
      ? a.category === (category as ArticleCategorySlug)
      : true;
    const matchesQuery = q
      ? a.title.toLowerCase().includes(q.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(q.toLowerCase())
      : true;
    return matchesCategory && matchesQuery;
  });

  return (
    <Container className="py-12">
      <SectionHeading
        align="left"
        eyebrow="Knowledge Hub"
        title="KIẾN THỨC THÚ Y TỪ VETJOY"
        description="Kiến thức chăn nuôi và chăm sóc vật nuôi được VETJOY tổng hợp."
      />

      <div className="mt-8">
        <Suspense fallback={null}>
          <KnowledgeFilters
            categories={categories}
            initialQuery={q}
            initialCategory={category}
          />
        </Suspense>
      </div>

      <p className="mt-4 text-sm text-neutral-500">
        {filtered.length} bài viết được tìm thấy
      </p>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <StateNotice tone="empty" title="Không tìm thấy bài viết phù hợp">
            Vui lòng thử từ khóa khác hoặc chọn chuyên mục khác.
          </StateNotice>
        </div>
      )}
    </Container>
  );
}
