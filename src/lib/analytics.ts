/**
 * Analytics event abstraction. No third-party tracker is wired up yet —
 * calling track() only logs in development so page code can be instrumented
 * now without waiting on Founder approval for a specific analytics vendor.
 */
export type AnalyticsEvent =
  | "cta_consult_click"
  | "consultation_submit"
  | "product_view"
  | "product_consult_click"
  | "dealer_submit"
  | "article_view"
  | "app_interest"
  | "phone_click"
  | "zalo_click";

export function track(event: AnalyticsEvent, payload?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[analytics] ${event}`, payload ?? {});
  }
  // TODO: forward to the approved analytics provider once selected by Founder.
}
