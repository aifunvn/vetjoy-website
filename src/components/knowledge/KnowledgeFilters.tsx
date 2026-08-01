"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ArticleCategory } from "@/types";

export function KnowledgeFilters({
  categories,
  initialQuery,
  initialCategory,
}: {
  categories: ArticleCategory[];
  initialQuery: string;
  initialCategory: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query);
      else params.delete("q");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function handleCategoryChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("category", value);
    else params.delete("category");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const hasFilters = Boolean(initialQuery || initialCategory);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <label htmlFor="article-search" className="sr-only">
          Tìm kiếm bài viết
        </label>
        <input
          id="article-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm bài viết..."
          className="focus-ring w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm"
        />
      </div>
      <label htmlFor="article-category" className="sr-only">
        Chuyên mục
      </label>
      <select
        id="article-category"
        value={initialCategory}
        onChange={(e) => handleCategoryChange(e.target.value)}
        className="focus-ring rounded-lg border border-neutral-300 px-4 py-2.5 text-sm sm:w-64"
      >
        <option value="">Tất cả chuyên mục</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      {hasFilters ? (
        <button
          type="button"
          onClick={() => {
            setQuery("");
            router.replace(pathname, { scroll: false });
          }}
          className="focus-ring whitespace-nowrap rounded-lg border border-neutral-300 px-4 py-2.5 text-sm text-neutral-600 hover:bg-neutral-50"
        >
          Xóa bộ lọc
        </button>
      ) : null}
    </div>
  );
}
