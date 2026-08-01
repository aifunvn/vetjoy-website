import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { listProducts } from "@/services/product-service";
import { listArticles } from "@/services/article-service";
import { listSolutions } from "@/services/solution-service";

const staticRoutes = [
  "",
  "/giai-phap",
  "/san-pham",
  "/tu-van-bac-si",
  "/kien-thuc",
  "/vetjoy-app",
  "/dai-ly",
  "/ve-vetjoy",
  "/lien-he",
  "/chinh-sach-bao-mat",
  "/dieu-khoan-su-dung",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, articles, solutions] = await Promise.all([
    listProducts(),
    listArticles(),
    listSolutions(),
  ]);

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));

  for (const solution of solutions) {
    entries.push({ url: `${siteConfig.url}/giai-phap/${solution.slug}`, changeFrequency: "monthly", priority: 0.7 });
  }
  for (const product of products) {
    entries.push({ url: `${siteConfig.url}/san-pham/${product.slug}`, changeFrequency: "monthly", priority: 0.6 });
  }
  for (const article of articles) {
    entries.push({
      url: `${siteConfig.url}/kien-thuc/${article.slug}`,
      changeFrequency: "monthly",
      priority: 0.5,
      lastModified: article.publishedAt,
    });
  }

  return entries;
}
