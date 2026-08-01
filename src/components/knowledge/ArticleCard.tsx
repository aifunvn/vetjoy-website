import Link from "next/link";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { DemoDataBadge } from "@/components/ui/Badge";
import { Icon } from "@/components/ui/Icon";
import { articleCategoryIcons } from "@/lib/category-icons";
import { articleCategories } from "@/data/article-categories";
import type { Article } from "@/types";

export function ArticleCard({ article }: { article: Article }) {
  const category = articleCategories.find((c) => c.slug === article.category);
  return (
    <Link
      href={`/kien-thuc/${article.slug}`}
      className="focus-ring card-vj card-vj-hover group flex h-full flex-col overflow-hidden p-0 hover:border-brand-teal-300"
    >
      <PlaceholderImage
        label={article.title}
        icon={articleCategoryIcons[article.category]}
        aspect="aspect-[16/9]"
        className="rounded-none border-none"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          {category ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-brand-teal-600">
              <Icon name={articleCategoryIcons[article.category]} className="h-3.5 w-3.5" />
              {category.name}
            </span>
          ) : null}
          {article.isDemo ? <DemoDataBadge /> : null}
        </div>
        <p className="font-semibold text-neutral-800 group-hover:text-brand-green-700">
          {article.title}
        </p>
        <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{article.excerpt}</p>
        <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
          <span className="text-xs text-neutral-400">{article.readingMinutes} phút đọc</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-green-700">
            Đọc tiếp
            <Icon
              name="arrow-right"
              className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
