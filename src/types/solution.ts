import type { DemoFlagged } from "./common";

export type SolutionSlug =
  | "van-nuoi-co-van-de"
  | "phong-benh"
  | "vaccine"
  | "dinh-duong"
  | "an-toan-sinh-hoc"
  | "cham-soc-thu-cung"
  | "quan-ly-trang-trai";

export interface Solution extends DemoFlagged {
  slug: SolutionSlug;
  title: string;
  shortDescription: string;
  problem: string;
  desiredOutcome: string;
  vetjoyApproach: string[];
  relatedProductCategories: string[];
  relatedArticleSlugs: string[];
  ctaLabel: string;
}
