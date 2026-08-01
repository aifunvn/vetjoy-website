import type { DemoFlagged } from "./common";

export type ProductCategorySlug =
  | "thuoc-thu-y"
  | "vaccine"
  | "thuc-an"
  | "che-pham-sinh-hoc"
  | "sat-trung"
  | "dung-cu-thu-y"
  | "cham-soc-thu-cung";

export interface ProductCategory {
  slug: ProductCategorySlug;
  name: string;
  description: string;
}

/**
 * Product detail fields mirror what a real veterinary product datasheet needs.
 * Every field below MUST come from founder-verified source data in production.
 * Until then, only isDemo:true sample records may populate this shape.
 */
export interface Product extends DemoFlagged {
  slug: string;
  name: string;
  category: ProductCategorySlug;
  imagePlaceholder: string;
  shortDescription: string;
  usage: string;
  targetAnimals: AnimalTargetSlug[];
  composition: string;
  instructions: string;
  packaging: string;
  manufacturer: string;
  notes: string;
}

export type AnimalTargetSlug = "gia_suc" | "gia_cam" | "thu_cung" | "khac";

export const ANIMAL_TARGET_LABELS: Record<AnimalTargetSlug, string> = {
  gia_suc: "Gia súc",
  gia_cam: "Gia cầm",
  thu_cung: "Thú cưng",
  khac: "Khác",
};
