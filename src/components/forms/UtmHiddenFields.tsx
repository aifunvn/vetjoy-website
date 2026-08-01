"use client";

import { useEffect, useRef } from "react";
import { getStoredUtm } from "@/lib/utm";

const FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

/** Fills hidden utm_* inputs from localStorage right before the form can be submitted. */
export function UtmHiddenFields() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const utm = getStoredUtm();
    const container = containerRef.current;
    if (!container) return;
    for (const field of FIELDS) {
      const input = container.querySelector<HTMLInputElement>(`input[name="${field}"]`);
      if (input && utm[field]) input.value = utm[field] as string;
    }
  }, []);

  return (
    <div ref={containerRef} hidden aria-hidden="true">
      {FIELDS.map((field) => (
        <input key={field} type="hidden" name={field} defaultValue="" />
      ))}
    </div>
  );
}
