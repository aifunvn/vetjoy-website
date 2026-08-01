import type { DemoFlagged } from "./common";

export interface Testimonial extends DemoFlagged {
  id: string;
  authorName: string;
  authorRole: string;
  quote: string;
  location?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}
