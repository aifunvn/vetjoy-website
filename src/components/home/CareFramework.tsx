import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon, type IconName } from "@/components/ui/Icon";

const steps: { step: string; icon: IconName; title: string; desc: string }[] = [
  { step: "1", icon: "clipboard", title: "Ghi nhận", desc: "Ghi nhận tình trạng vật nuôi." },
  { step: "2", icon: "search", title: "Đánh giá", desc: "Đánh giá vấn đề đang gặp phải." },
  { step: "3", icon: "lightbulb", title: "Giải pháp", desc: "Đề xuất giải pháp phù hợp." },
  { step: "4", icon: "activity", title: "Theo dõi", desc: "Theo dõi quá trình thực hiện." },
  { step: "5", icon: "bell", title: "Chăm sóc tiếp", desc: "Nhắc lịch và chăm sóc tiếp theo." },
];

export function CareFramework() {
  return (
    <section className="section-py bg-brand-green-900 text-white">
      <Container>
        <SectionHeading
          eyebrow="Phương pháp VETJOY"
          title="VETJOY CARE 5"
          description="5 bước đồng hành cùng vật nuôi của bạn, từ ghi nhận đến chăm sóc lâu dài."
        />

        {/* Desktop / tablet: horizontal timeline with a connecting line */}
        <div className="relative mt-16 hidden lg:grid lg:grid-cols-5 lg:gap-4">
          <div
            aria-hidden="true"
            className="absolute left-[10%] right-[10%] top-7 h-0.5 bg-white/15"
          />
          {steps.map((s) => (
            <div key={s.step} className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-white text-brand-green-700 shadow-md ring-8 ring-brand-green-900">
                <Icon name={s.icon} className="h-6 w-6" />
              </div>
              <span className="mt-4 text-xs font-bold uppercase tracking-wide text-brand-green-300">
                Bước {s.step}
              </span>
              <p className="mt-1 font-semibold">{s.title}</p>
              <p className="mt-1 max-w-[18ch] text-sm text-white/70">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Mobile: vertical timeline */}
        <div className="relative mt-12 space-y-8 lg:hidden">
          <div
            aria-hidden="true"
            className="absolute bottom-2 left-7 top-2 w-0.5 bg-white/15"
          />
          {steps.map((s) => (
            <div key={s.step} className="relative flex items-start gap-4">
              <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-brand-green-700 shadow-md ring-8 ring-brand-green-900">
                <Icon name={s.icon} className="h-6 w-6" />
              </div>
              <div className="pt-2">
                <span className="text-xs font-bold uppercase tracking-wide text-brand-green-300">
                  Bước {s.step}
                </span>
                <p className="mt-0.5 font-semibold">{s.title}</p>
                <p className="mt-1 text-sm text-white/70">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
