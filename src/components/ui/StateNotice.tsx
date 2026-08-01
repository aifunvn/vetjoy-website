import type { ReactNode } from "react";

type Tone = "success" | "error" | "empty";

const toneClasses: Record<Tone, string> = {
  success: "border-success-500 bg-success-50 text-success-700",
  error: "border-danger-500 bg-danger-50 text-danger-700",
  empty: "border-neutral-300 bg-neutral-50 text-neutral-600",
};

export function StateNotice({
  tone,
  title,
  children,
}: {
  tone: Tone;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-xl border p-5 ${toneClasses[tone]}`}
    >
      <p className="font-semibold">{title}</p>
      {children ? <div className="mt-1 text-sm">{children}</div> : null}
    </div>
  );
}
