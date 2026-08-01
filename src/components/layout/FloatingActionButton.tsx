"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { siteConfig, headerCta } from "@/config/site";
import { track, type AnalyticsEvent } from "@/lib/analytics";

interface QuickAction {
  key: string;
  label: string;
  icon: IconName;
  href: string | null;
  external?: boolean;
  event?: AnalyticsEvent;
}

const actions: QuickAction[] = [
  { key: "consult", label: "Nhận tư vấn", icon: "chat", href: headerCta.href, event: "cta_consult_click" },
  { key: "call", label: "Gọi điện", icon: "phone", href: siteConfig.contact.phoneHref, event: "phone_click" },
  { key: "zalo", label: "Chat Zalo", icon: "zalo", href: siteConfig.contact.zaloHref, external: true, event: "zalo_click" },
  { key: "messenger", label: "Messenger", icon: "message-circle", href: siteConfig.social.messenger, external: true },
];

function ActionButton({ action, onNavigate }: { action: QuickAction; onNavigate: () => void }) {
  const bubble = (
    <>
      <span className="whitespace-nowrap text-sm font-medium text-neutral-700">
        {action.label}
      </span>
      <span className="icon-tile h-8 w-8 bg-brand-green-600 text-white">
        <Icon name={action.icon} className="h-4 w-4" />
      </span>
    </>
  );

  if (!action.href) {
    return (
      <span
        aria-disabled="true"
        title={`${action.label} — chưa cập nhật`}
        className="flex cursor-not-allowed items-center gap-2.5 rounded-full bg-white py-2 pl-4 pr-2 shadow-lg ring-1 ring-neutral-200"
      >
        <span className="whitespace-nowrap text-sm font-medium text-neutral-300">
          {action.label}
        </span>
        <span className="icon-tile h-8 w-8 bg-neutral-100 text-neutral-300">
          <Icon name={action.icon} className="h-4 w-4" />
        </span>
      </span>
    );
  }

  const className =
    "focus-ring flex items-center gap-2.5 rounded-full bg-white py-2 pl-4 pr-2 shadow-lg ring-1 ring-neutral-200 transition-colors hover:bg-brand-green-50";

  if (action.external) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          if (action.event) track(action.event, { placement: "fab" });
        }}
        className={className}
      >
        {bubble}
      </a>
    );
  }

  return (
    <Link
      href={action.href}
      onClick={() => {
        if (action.event) track(action.event, { placement: "fab" });
        onNavigate();
      }}
      className={className}
    >
      {bubble}
    </Link>
  );
}

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      {open ? (
        <div className="flex flex-col items-end gap-2.5">
          {actions.map((action) => (
            <ActionButton key={action.key} action={action} onNavigate={() => setOpen(false)} />
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Đóng menu liên hệ nhanh" : "Mở menu liên hệ nhanh"}
        className="focus-ring flex h-14 w-14 items-center justify-center rounded-full bg-brand-green-600 text-white shadow-xl transition-transform hover:scale-105 hover:bg-brand-green-700"
      >
        <Icon name={open ? "close" : "chat"} className="h-6 w-6" />
      </button>
    </div>
  );
}
