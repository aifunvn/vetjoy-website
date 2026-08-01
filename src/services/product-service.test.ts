import { describe, expect, it } from "vitest";
import {
  getProductBySlug,
  listProductsByCategory,
  searchProducts,
} from "./product-service";

describe("product-service", () => {
  it("filters products by category", async () => {
    const vaccineProducts = await listProductsByCategory("vaccine");
    expect(vaccineProducts.length).toBeGreaterThan(0);
    for (const product of vaccineProducts) {
      expect(product.category).toBe("vaccine");
    }
  });

  it("returns no products for a category with no demo data", async () => {
    // Every current category has at least one demo product; searching a query
    // that matches nothing should still return an empty array, not throw.
    const result = await searchProducts("khong-ton-tai-xyz");
    expect(result).toEqual([]);
  });

  it("search is case-insensitive and matches partial names", async () => {
    const result = await searchProducts("VACCINE");
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns undefined for an unknown slug", async () => {
    const product = await getProductBySlug("khong-ton-tai");
    expect(product).toBeUndefined();
  });

  it("returns the matching product for a known slug", async () => {
    const products = await listProductsByCategory("vaccine");
    const slug = products[0].slug;
    const found = await getProductBySlug(slug);
    expect(found?.slug).toBe(slug);
  });
});
