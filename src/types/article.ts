import type { DemoFlagged } from "./common";

export type ArticleCategorySlug =
  | "gia-suc"
  | "gia-cam"
  | "thu-cung"
  | "phong-benh"
  | "vaccine"
  | "dinh-duong"
  | "an-toan-sinh-hoc"
  | "kinh-nghiem-chan-nuoi";

export interface ArticleCategory {
  slug: ArticleCategorySlug;
  name: string;
}

export interface Article extends DemoFlagged {
  slug: string;
  title: string;
  category: ArticleCategorySlug;
  excerpt: string;
  content: string[];
  publishedAt: string; // ISO date
  readingMinutes: number;
  coverImagePlaceholder: string;
}
