import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StateNotice } from "@/components/ui/StateNotice";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import {
  listProductCategories,
  listProducts,
} from "@/services/product-service";
import type { ProductCategorySlug } from "@/types";

export const metadata: Metadata = {
  title: "Sản phẩm",
  description:
    "Thư viện sản phẩm VETJOY: thuốc thú y, vaccine, thức ăn, chế phẩm sinh học, sát trùng, dụng cụ thú y và chăm sóc thú cưng.",
  alternates: { canonical: "/san-pham" },
};

interface SearchParams {
  category?: string;
  q?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { category = "", q = "" } = await searchParams;
  const [allProducts, categories] = await Promise.all([
    listProducts(),
    listProductCategories(),
  ]);

  const filtered = allProducts.filter((p) => {
    const matchesCategory = category ? p.category === (category as ProductCategorySlug) : true;
    const matchesQuery = q
      ? p.name.toLowerCase().includes(q.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(q.toLowerCase())
      : true;
    return matchesCategory && matchesQuery;
  });

  return (
    <Container className="py-12">
      <SectionHeading
        align="left"
        eyebrow="Thư viện sản phẩm"
        title="SẢN PHẨM VETJOY"
        description="Tìm sản phẩm theo danh mục hoặc từ khóa."
      />

      <div className="mt-8">
        <Suspense fallback={null}>
          <ProductFilters
            categories={categories}
            initialQuery={q}
            initialCategory={category}
          />
        </Suspense>
      </div>

      <p className="mt-4 text-sm text-neutral-500">
        {filtered.length} sản phẩm được tìm thấy
      </p>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <StateNotice tone="empty" title="Không tìm thấy sản phẩm phù hợp">
            Vui lòng thử từ khóa khác hoặc chọn danh mục khác. Bạn cũng có thể{" "}
            <a href="/tu-van-bac-si" className="font-semibold underline">
              gửi yêu cầu tư vấn
            </a>{" "}
            để VETJOY hỗ trợ trực tiếp.
          </StateNotice>
        </div>
      )}
    </Container>
  );
}
