/** UTM parameters captured from the URL when a visitor lands on the site. */
export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

/** Marks any record built from placeholder/sample data rather than founder-verified content. */
export interface DemoFlagged {
  isDemo: true;
}

export type AnimalType =
  | "gia_suc" // gia súc (cattle, pigs, etc.)
  | "gia_cam" // gia cầm (poultry)
  | "thu_cung" // chó, mèo
  | "khac";

export const ANIMAL_TYPE_LABELS: Record<AnimalType, string> = {
  gia_suc: "Gia súc",
  gia_cam: "Gia cầm",
  thu_cung: "Thú cưng (chó, mèo)",
  khac: "Khác",
};

export type FormStatus = "idle" | "submitting" | "success" | "error";
