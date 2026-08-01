import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DemoDataBadge } from "@/components/ui/Badge";
import type { Testimonial } from "@/types";

function initialsOf(name: string): string {
  const cleaned = name.replace(/^\[Mẫu\]\s*/i, "");
  const parts = cleaned.trim().split(/\s+/);
  return parts[parts.length - 1]?.[0]?.toUpperCase() ?? "V";
}

export function TestimonialsSection({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="section-py">
      <Container>
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <SectionHeading eyebrow="Khách hàng nói gì" title="ĐƯỢC TIN DÙNG BỞI NGƯỜI CHĂN NUÔI" />
          <DemoDataBadge verified />
        </div>
        <div className="mt-4 grid gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <figure key={t.id} className="card-vj card-vj-hover relative flex h-full flex-col p-6">
              <span
                aria-hidden="true"
                className="absolute right-5 top-4 select-none font-serif text-5xl leading-none text-brand-green-100"
              >
                “
              </span>
              <blockquote className="relative text-sm leading-relaxed text-neutral-700">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-neutral-100 pt-4">
                <div className="icon-tile h-10 w-10 shrink-0 bg-brand-green-100 text-sm font-bold text-brand-green-700">
                  {initialsOf(t.authorName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800">{t.authorName}</p>
                  <p className="text-xs text-neutral-500">{t.authorRole}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
