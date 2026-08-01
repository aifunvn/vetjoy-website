import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";

const screenFeatures: { icon: IconName; label: string }[] = [
  { icon: "clipboard", label: "Hồ sơ vật nuôi" },
  { icon: "bell", label: "Nhắc lịch vaccine" },
  { icon: "activity", label: "Nhật ký sức khỏe" },
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[230px] sm:w-[260px]">
      <div className="relative rounded-[2.25rem] border-[8px] border-neutral-900 bg-neutral-900 shadow-xl">
        <div className="absolute left-1/2 top-0 z-10 h-4 w-20 -translate-x-1/2 rounded-b-lg bg-neutral-900" />
        <div className="relative aspect-[9/19] w-full overflow-hidden rounded-[1.7rem] bg-gradient-to-b from-brand-green-50 to-brand-teal-50">
          <div className="flex h-full flex-col p-4 pt-8">
            <span className="self-start rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
              Giao diện minh họa
            </span>
            <div className="mt-4 flex items-center gap-2">
              <div className="icon-tile h-9 w-9 bg-brand-green-600 text-white">
                <Icon name="app" className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-800">VETJOY App</p>
                <p className="text-[11px] text-neutral-500">Hồ sơ sức khỏe vật nuôi</p>
              </div>
            </div>
            <div className="mt-5 space-y-2.5">
              {screenFeatures.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2.5 rounded-xl bg-white/80 px-3 py-2.5 shadow-sm"
                >
                  <Icon name={f.icon} className="h-4 w-4 text-brand-green-600" />
                  <span className="text-xs font-medium text-neutral-700">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppTeaserSection() {
  return (
    <section className="section-py">
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <Badge tone="green">SẮP RA MẮT</Badge>
          <div className="mt-4">
            <SectionHeading
              align="left"
              eyebrow="VETJOY App"
              title="MỘT HỒ SƠ SỨC KHỎE CHO MỖI VẬT NUÔI"
            />
          </div>
          <p className="mt-4 text-neutral-600">
            VETJOY App được phát triển để giúp bạn lưu hồ sơ vật nuôi, nhắc lịch
            vaccine và theo dõi quá trình chăm sóc — tất cả ở một nơi.
          </p>
          <Link
            href="/vetjoy-app"
            className="focus-ring mt-6 inline-flex items-center justify-center gap-2 rounded-lg border-2 border-brand-green-600 px-6 py-3 text-sm font-semibold text-brand-green-700 transition-colors hover:bg-brand-green-50"
          >
            Tìm hiểu VETJOY App
            <Icon name="arrow-right" className="h-4 w-4" />
          </Link>
        </div>
        <PhoneMockup />
      </Container>
    </section>
  );
}
