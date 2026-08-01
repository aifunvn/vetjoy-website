import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { DemoDataBadge } from "@/components/ui/Badge";
import { ArticleCard } from "@/components/knowledge/ArticleCard";
import { TrackView } from "@/components/analytics/TrackView";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/config/site";
import { articleCategories } from "@/data/article-categories";
import {
  getArticleBySlug,
  listArticles,
  listRelatedArticles,
} from "@/services/article-service";

interface PageParams {
  slug: string;
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const articles = await listArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/kien-thuc/${article.slug}` },
    openGraph: { type: "article", publishedTime: article.publishedAt },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const category = articleCategories.find((c) => c.slug === article.category);
  const related = await listRelatedArticles(article.slug, article.category);

  return (
    <Container className="max-w-3xl py-12">
      <TrackView event="article_view" payload={{ slug: article.slug }} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.excerpt,
          datePublished: article.publishedAt,
          url: `${siteConfig.url}/kien-thuc/${article.slug}`,
          publisher: { "@type": "Organization", name: siteConfig.brandName },
        }}
      />
      {category ? (
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-teal-600">
          {category.name}
        </p>
      ) : null}
      <h1 className="mt-2 text-2xl font-bold text-neutral-900 sm:text-3xl">
        {article.title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <p className="text-sm text-neutral-500">
          {new Date(article.publishedAt).toLocaleDateString("vi-VN")} ·{" "}
          {article.readingMinutes} phút đọc
        </p>
        {article.isDemo ? <DemoDataBadge /> : null}
      </div>

      <div className="mt-6">
        <PlaceholderImage label={article.title} aspect="aspect-[16/9]" />
      </div>

      <div className="prose prose-neutral mt-8 max-w-none">
        {article.content.map((paragraph) => (
          <p key={paragraph} className="mb-4 text-neutral-700">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-10 rounded-xl bg-brand-teal-600 p-6 text-center text-white">
        <p className="font-semibold">Cần tư vấn thêm về tình trạng vật nuôi của bạn?</p>
        <Link
          href="/tu-van-bac-si"
          className="focus-ring mt-4 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-teal-700 hover:bg-brand-teal-50"
        >
          NHẬN TƯ VẤN BÁC SĨ THÚ Y
        </Link>
      </div>

      {related.length > 0 ? (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-neutral-900">Bài viết liên quan</h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} />
            ))}
          </div>
        </div>
      ) : null}
    </Container>
  );
}
