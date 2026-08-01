import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArticleCard } from "@/components/knowledge/ArticleCard";
import type { Article } from "@/types";

export function KnowledgePreviewSection({ articles }: { articles: Article[] }) {
  return (
    <section className="border-t border-neutral-200 bg-neutral-50 py-16">
      <Container>
        <SectionHeading
          eyebrow="Kiến thức thú y"
          title="BÀI VIẾT MỚI TỪ VETJOY"
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/kien-thuc"
            className="focus-ring text-sm font-semibold text-brand-green-700 hover:underline"
          >
            Xem toàn bộ kiến thức →
          </Link>
        </div>
      </Container>
    </section>
  );
}
