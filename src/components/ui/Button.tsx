import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-green-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-brand-green-700 hover:shadow-md active:translate-y-0 active:bg-brand-green-800",
  secondary:
    "bg-brand-teal-500 text-white shadow-sm hover:-translate-y-0.5 hover:bg-brand-teal-600 hover:shadow-md active:translate-y-0 active:bg-brand-teal-700",
  outline:
    "border-2 border-brand-green-600 text-brand-green-700 hover:bg-brand-green-50",
  ghost: "text-brand-green-700 hover:bg-brand-green-50",
};

const sizeClasses: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const base =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-60 disabled:pointer-events-none disabled:translate-y-0 disabled:shadow-none";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: CommonProps & { href: string }) {
  return (
    <Link
      href={href}
      className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </Link>
  );
}
