import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";

const items: { icon: IconName; value: string; label: string }[] = [
  { icon: "experience", value: "20+ năm", label: "Kinh nghiệm thú y" },
  { icon: "stethoscope", value: "Bác sĩ thú y", label: "Đồng hành cùng bạn" },
  { icon: "heartbeat", value: "Liên tục", label: "Theo dõi & chăm sóc" },
  { icon: "app", value: "VETJOY App", label: "Theo dõi vật nuôi" },
];

export function TrustBar() {
  return (
    <section className="border-b border-neutral-200 bg-white py-8 sm:py-10">
      <Container>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2.5 rounded-xl px-3 py-4 text-center transition-colors hover:bg-brand-green-50 sm:flex-row sm:gap-3 sm:text-left"
            >
              <div className="icon-tile h-11 w-11 bg-brand-green-50 text-brand-green-700">
                <Icon name={item.icon} className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900 sm:text-base">
                  {item.value}
                </p>
                <p className="text-xs text-neutral-500 sm:text-sm">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
