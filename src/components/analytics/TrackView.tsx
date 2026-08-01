"use client";

import { useEffect, useRef } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Fires a single analytics event when the page mounts (client-only, no visual output). */
export function TrackView({
  event,
  payload,
}: {
  event: AnalyticsEvent;
  payload?: Record<string, unknown>;
}) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    track(event, payload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
