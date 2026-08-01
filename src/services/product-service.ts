import { products } from "@/data/products";
import { productCategories } from "@/data/product-categories";
import type { Product, ProductCategory, ProductCategorySlug } from "@/types";

/**
 * Read-side data access for products. Functions are async on purpose:
 * today they resolve synchronously from local demo data, but the call
 * sites (Server Components) already await them, so swapping the body
 * for a Supabase query later requires no changes outside this file.
 */
export async function listProducts(): Promise<Product[]> {
  return products;
}

export async function listProductCategories(): Promise<ProductCategory[]> {
  return productCategories;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  return products.find((p) => p.slug === slug);
}

export async function listProductsByCategory(
  category: ProductCategorySlug
): Promise<Product[]> {
  return products.filter((p) => p.category === category);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.shortDescription.toLowerCase().includes(q)
  );
}
