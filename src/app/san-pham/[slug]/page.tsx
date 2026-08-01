import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { DemoDataBadge } from "@/components/ui/Badge";
import { TrackView } from "@/components/analytics/TrackView";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { productCategoryIcons } from "@/lib/category-icons";
import { ANIMAL_TARGET_LABELS } from "@/types";
import {
  getProductBySlug,
  listProducts,
} from "@/services/product-service";
import { productCategories } from "@/data/product-categories";

interface PageParams {
  slug: string;
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const products = await listProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/san-pham/${product.slug}` },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const category = productCategories.find((c) => c.slug === product.category);

  return (
    <Container className="py-12">
      <TrackView event="product_view" payload={{ slug: product.slug }} />
      <div className="grid gap-10 lg:grid-cols-2">
        <PlaceholderImage
          label={product.name}
          icon={productCategoryIcons[product.category]}
          aspect="aspect-square"
        />
        <div>
          {category ? (
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-teal-600">
              {category.name}
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-bold text-neutral-900 sm:text-3xl">
            {product.name}
          </h1>
          <div className="mt-3">
            <DemoDataBadge />
          </div>
          <p className="mt-4 text-neutral-600">{product.shortDescription}</p>

          <dl className="mt-6 space-y-4 divide-y divide-neutral-200 rounded-xl border border-neutral-200 p-5">
            <Detail term="Đối tượng sử dụng">
              {product.targetAnimals.map((a) => ANIMAL_TARGET_LABELS[a]).join(", ")}
            </Detail>
            <Detail term="Công dụng">{product.usage}</Detail>
            <Detail term="Thành phần">{product.composition}</Detail>
            <Detail term="Hướng dẫn sử dụng">{product.instructions}</Detail>
            <Detail term="Quy cách">{product.packaging}</Detail>
            <Detail term="Nhà sản xuất">{product.manufacturer}</Detail>
            <Detail term="Lưu ý">{product.notes}</Detail>
          </dl>

          <TrackedLink
            event="product_consult_click"
            payload={{ slug: product.slug }}
            href="/tu-van-bac-si"
            className="focus-ring mt-6 inline-flex items-center justify-center rounded-lg bg-brand-green-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-green-700"
          >
            NHẬN TƯ VẤN VỀ SẢN PHẨM NÀY
          </TrackedLink>
        </div>
      </div>
    </Container>
  );
}

function Detail({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="pt-4 first:pt-0">
      <dt className="text-sm font-semibold text-neutral-800">{term}</dt>
      <dd className="mt-1 text-sm text-neutral-600">{children}</dd>
    </div>
  );
}
