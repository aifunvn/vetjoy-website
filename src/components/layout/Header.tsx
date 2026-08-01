"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNav, headerCta, siteConfig } from "@/config/site";
import { track } from "@/lib/analytics";

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="container-vj flex h-16 items-center justify-between">
        <Link
          href="/"
          className="focus-ring flex items-center gap-2 rounded"
          onClick={() => setOpen(false)}
        >
          <span className="text-xl font-extrabold tracking-tight text-brand-green-700">
            {siteConfig.brandName}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Điều hướng chính">
          {primaryNav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`focus-ring rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "text-brand-green-700"
                    : "text-neutral-600 hover:text-brand-green-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={headerCta.href}
            onClick={() => track("cta_consult_click", { placement: "header" })}
            className="focus-ring hidden rounded-lg bg-brand-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-green-700 sm:inline-flex"
          >
            {headerCta.label}
          </Link>
          <button
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-lg text-neutral-700 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Đóng menu" : "Mở menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Điều hướng di động"
          className="border-t border-neutral-200 bg-white lg:hidden"
        >
          <div className="container-vj flex flex-col gap-1 py-3">
            {primaryNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="focus-ring rounded-lg px-3 py-3 text-base font-medium text-neutral-700 hover:bg-brand-green-50 hover:text-brand-green-700"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={headerCta.href}
              onClick={() => {
                setOpen(false);
                track("cta_consult_click", { placement: "mobile-nav" });
              }}
              className="focus-ring mt-2 rounded-lg bg-brand-green-600 px-4 py-3 text-center text-base font-semibold text-white hover:bg-brand-green-700"
            >
              {headerCta.label}
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
