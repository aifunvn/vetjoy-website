import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber";
}) {
  const toneClasses = {
    neutral: "bg-neutral-100 text-neutral-700",
    green: "bg-brand-green-50 text-brand-green-700",
    amber: "bg-accent-amber-100 text-accent-amber-700",
  }[tone];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${toneClasses}`}
    >
      {children}
    </span>
  );
}

/** Mandatory label for any sample/placeholder content shown to visitors. */
export function DemoDataBadge({ verified = false }: { verified?: boolean }) {
  return (
    <Badge tone="amber">
      {verified ? "DỮ LIỆU MẪU – CẦN THAY BẰNG DỮ LIỆU ĐÃ XÁC MINH" : "DỮ LIỆU MẪU"}
    </Badge>
  );
}
