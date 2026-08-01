"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { captureUtmFromLocation } from "@/lib/utm";

/** Persists utm_* params (if present in the URL) to localStorage on every navigation. */
export function UtmTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    captureUtmFromLocation();
    // Re-run whenever the query string changes (client-side navigations).
  }, [searchParams]);

  return null;
}
