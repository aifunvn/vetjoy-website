import { articles } from "@/data/articles";
import { articleCategories } from "@/data/article-categories";
import type { Article, ArticleCategory, ArticleCategorySlug } from "@/types";

export async function listArticles(): Promise<Article[]> {
  return [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function listArticleCategories(): Promise<ArticleCategory[]> {
  return articleCategories;
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  return articles.find((a) => a.slug === slug);
}

export async function listArticlesByCategory(
  category: ArticleCategorySlug
): Promise<Article[]> {
  return articles.filter((a) => a.category === category);
}

export async function searchArticles(query: string): Promise<Article[]> {
  const q = query.trim().toLowerCase();
  if (!q) return listArticles();
  return articles.filter(
    (a) =>
      a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q)
  );
}

export async function listRelatedArticles(
  currentSlug: string,
  category: ArticleCategorySlug,
  limit = 3
): Promise<Article[]> {
  return articles
    .filter((a) => a.slug !== currentSlug && a.category === category)
    .slice(0, limit);
}
