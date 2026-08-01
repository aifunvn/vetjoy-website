import Link from "next/link";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { DemoDataBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { productCategoryIcons } from "@/lib/category-icons";
import { productCategories } from "@/data/product-categories";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const category = productCategories.find((c) => c.slug === product.category);
  return (
    <Link
      href={`/san-pham/${product.slug}`}
      className="focus-ring card-vj card-vj-hover group flex h-full flex-col overflow-hidden p-0 hover:border-brand-teal-300"
    >
      <PlaceholderImage
        label={product.name}
        icon={productCategoryIcons[product.category]}
        aspect="aspect-[4/3]"
        className="rounded-none border-none"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          {category ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-teal-600">
              <Icon name={productCategoryIcons[product.category]} className="h-3.5 w-3.5" />
              {category.name}
            </span>
          ) : null}
          {product.isDemo ? <DemoDataBadge /> : null}
        </div>
        <p className="font-semibold text-neutral-800 group-hover:text-brand-green-700">
          {product.name}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">
          {product.shortDescription}
        </p>
      </div>
    </Link>
  );
}
