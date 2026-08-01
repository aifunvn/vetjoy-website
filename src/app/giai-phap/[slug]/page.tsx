import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getSolutionBySlug, listSolutions } from "@/services/solution-service";
import { listProductCategories } from "@/services/product-service";

interface PageParams {
  slug: string;
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const solutions = await listSolutions();
  return solutions.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);
  if (!solution) return {};
  return {
    title: solution.title,
    description: solution.shortDescription,
    alternates: { canonical: `/giai-phap/${solution.slug}` },
  };
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const solution = await getSolutionBySlug(slug);
  if (!solution) notFound();

  const allCategories = await listProductCategories();
  const relatedCategories = allCategories.filter((c) =>
    solution.relatedProductCategories.includes(c.slug)
  );

  return (
    <Container className="max-w-3xl py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-teal-600">
        Giải pháp VETJOY
      </p>
      <h1 className="mt-2 text-3xl font-bold text-neutral-900">{solution.title}</h1>
      <p className="mt-3 text-neutral-600">{solution.shortDescription}</p>

      <section className="mt-8 rounded-xl border border-neutral-200 p-6">
        <h2 className="font-semibold text-neutral-800">Vấn đề bạn đang gặp phải</h2>
        <p className="mt-2 text-sm text-neutral-600">{solution.problem}</p>
      </section>

      <section className="mt-6 rounded-xl border border-neutral-200 p-6">
        <h2 className="font-semibold text-neutral-800">Kết quả mong muốn</h2>
        <p className="mt-2 text-sm text-neutral-600">{solution.desiredOutcome}</p>
      </section>

      <section className="mt-6 rounded-xl border border-brand-green-200 bg-brand-green-50 p-6">
        <h2 className="font-semibold text-brand-green-800">Cách tiếp cận của VETJOY</h2>
        <ol className="mt-3 space-y-2">
          {solution.vetjoyApproach.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm text-neutral-700">
              <span className="font-bold text-brand-green-700">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {relatedCategories.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-semibold text-neutral-800">Sản phẩm liên quan</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedCategories.map((c) => (
              <Link
                key={c.slug}
                href={`/san-pham?category=${c.slug}`}
                className="focus-ring rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-neutral-700 hover:border-brand-teal-400 hover:text-brand-teal-700"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10 rounded-xl bg-brand-teal-600 p-6 text-center text-white">
        <p className="font-semibold">Sẵn sàng để VETJOY hỗ trợ bạn?</p>
        <Link
          href="/tu-van-bac-si"
          className="focus-ring mt-4 inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-semibold text-brand-teal-700 hover:bg-brand-teal-50"
        >
          {solution.ctaLabel.toUpperCase()}
        </Link>
      </div>
    </Container>
  );
}
