import type { IconName } from "@/components/ui/Icon";
import type { ArticleCategorySlug, ProductCategorySlug, SolutionSlug } from "@/types";

export const productCategoryIcons: Record<ProductCategorySlug, IconName> = {
  "thuoc-thu-y": "pill",
  vaccine: "syringe",
  "thuc-an": "leaf",
  "che-pham-sinh-hoc": "flask",
  "sat-trung": "spray",
  "dung-cu-thu-y": "toolbox",
  "cham-soc-thu-cung": "paw",
};

export const solutionIcons: Record<SolutionSlug, IconName> = {
  "van-nuoi-co-van-de": "alert",
  "phong-benh": "shield-check",
  vaccine: "syringe",
  "dinh-duong": "leaf",
  "an-toan-sinh-hoc": "spray",
  "cham-soc-thu-cung": "paw",
  "quan-ly-trang-trai": "barn",
};

export const articleCategoryIcons: Record<ArticleCategorySlug, IconName> = {
  "gia-suc": "barn",
  "gia-cam": "activity",
  "thu-cung": "paw",
  "phong-benh": "shield-check",
  vaccine: "syringe",
  "dinh-duong": "leaf",
  "an-toan-sinh-hoc": "spray",
  "kinh-nghiem-chan-nuoi": "lightbulb",
};
