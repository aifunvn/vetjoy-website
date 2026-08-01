"use client";

import type { AnchorHTMLAttributes } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

export function TrackedLink({
  event,
  payload,
  children,
  ...props
}: {
  event: AnalyticsEvent;
  payload?: Record<string, unknown>;
} & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a {...props} onClick={() => track(event, payload)}>
      {children}
    </a>
  );
}
