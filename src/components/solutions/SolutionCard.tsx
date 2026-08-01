import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { solutionIcons } from "@/lib/category-icons";
import type { Solution } from "@/types";

export function SolutionCard({ solution }: { solution: Solution }) {
  return (
    <Link
      href={`/giai-phap/${solution.slug}`}
      className="focus-ring card-vj card-vj-hover group flex h-full flex-col p-6 hover:border-brand-green-300"
    >
      <div className="icon-tile h-11 w-11 bg-brand-green-50 text-brand-green-700 transition-colors group-hover:bg-brand-green-600 group-hover:text-white">
        <Icon name={solutionIcons[solution.slug]} className="h-5 w-5" />
      </div>
      <p className="mt-4 text-lg font-semibold text-neutral-800 group-hover:text-brand-green-700">
        {solution.title}
      </p>
      <p className="mt-2 flex-1 text-sm text-neutral-600">{solution.shortDescription}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-teal-600">
        Xem chi tiết
        <Icon
          name="arrow-right"
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}
