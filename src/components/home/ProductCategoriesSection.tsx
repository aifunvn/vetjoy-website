import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { productCategoryIcons } from "@/lib/category-icons";
import type { ProductCategory } from "@/types";

export function ProductCategoriesSection({
  categories,
}: {
  categories: ProductCategory[];
}) {
  return (
    <section className="section-py">
      <Container>
        <SectionHeading
          eyebrow="Sản phẩm"
          title="DANH MỤC SẢN PHẨM VETJOY"
          description="Đầy đủ giải pháp cho chăn nuôi và chăm sóc vật nuôi."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/san-pham?category=${cat.slug}`}
              className="focus-ring card-vj card-vj-hover group flex h-full flex-col p-5 hover:border-brand-teal-300"
            >
              <div className="icon-tile h-11 w-11 bg-brand-teal-50 text-brand-teal-700 transition-colors group-hover:bg-brand-teal-500 group-hover:text-white">
                <Icon name={productCategoryIcons[cat.slug]} className="h-5 w-5" />
              </div>
              <p className="mt-4 font-semibold text-neutral-800">{cat.name}</p>
              <p className="mt-2 text-sm text-neutral-600">{cat.description}</p>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/san-pham"
            className="focus-ring inline-flex items-center gap-1 text-sm font-semibold text-brand-green-700 hover:underline"
          >
            Xem toàn bộ sản phẩm
            <Icon name="arrow-right" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
