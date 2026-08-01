import type { UtmParams } from "@/types";

const UTM_KEYS: (keyof UtmParams)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
];

const STORAGE_KEY = "vetjoy_utm";

/** Extracts recognised utm_* params from a URLSearchParams instance. */
export function extractUtmFromSearchParams(params: URLSearchParams): UtmParams {
  const result: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) result[key] = value;
  }
  return result;
}

/** Reads the UTM params captured on the visitor's first touch this session (client-only). */
export function getStoredUtm(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}

/** Persists UTM params from the current URL, if any are present (client-only). */
export function captureUtmFromLocation(): void {
  if (typeof window === "undefined") return;
  const params = extractUtmFromSearchParams(
    new URLSearchParams(window.location.search)
  );
  if (Object.keys(params).length === 0) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  } catch {
    // localStorage unavailable (private mode, etc.) — safe to ignore, UTM is best-effort.
  }
}
