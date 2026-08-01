import Link from "next/link";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Icon } from "@/components/ui/Icon";

const trustPoints = [
  { icon: "experience", label: "Hơn 20 năm kinh nghiệm" },
  { icon: "stethoscope", label: "Bác sĩ thú y đồng hành" },
  { icon: "chat", label: "Tư vấn chuyên môn" },
  { icon: "heartbeat", label: "Theo dõi liên tục" },
] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-brand-green-50 via-white to-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-teal-100/50 blur-3xl"
      />
      <div className="container-vj relative grid gap-12 py-14 lg:grid-cols-2 lg:items-center lg:py-24">
        <div className="animate-fade-up">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-green-700 shadow-sm ring-1 ring-brand-green-200">
            <Icon name="shield-check" className="h-3.5 w-3.5" />
            VETJOY — Hệ sinh thái chăm sóc vật nuôi
          </span>

          <h1 className="mt-5 text-3xl font-extrabold leading-[1.15] tracking-tight text-neutral-900 sm:text-4xl lg:text-[2.75rem]">
            GIẢI PHÁP THÚ Y TOÀN DIỆN
            <br />
            <span className="text-brand-green-700">
              ĐỒNG HÀNH CÙNG NGƯỜI CHĂN NUÔI
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
            VETJOY kết hợp sản phẩm thú y, kinh nghiệm chuyên môn trên 20 năm và
            công nghệ để đồng hành cùng bạn trong suốt quá trình chăm sóc vật
            nuôi — không chỉ dừng lại ở việc bán thuốc.
          </p>

          <ul className="mt-6 grid grid-cols-2 gap-3 sm:max-w-lg">
            {trustPoints.map((point) => (
              <li
                key={point.label}
                className="flex items-center gap-2.5 rounded-lg bg-white/70 px-3 py-2.5 text-sm font-medium text-neutral-700 ring-1 ring-neutral-200"
              >
                <Icon name={point.icon} className="h-4 w-4 shrink-0 text-brand-green-600" />
                {point.label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/tu-van-bac-si"
              className="focus-ring group inline-flex items-center justify-center gap-2 rounded-lg bg-brand-green-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-green-700 hover:shadow-md"
            >
              Nhận tư vấn bác sĩ
              <Icon
                name="arrow-right"
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              href="/giai-phap"
              className="focus-ring inline-flex items-center justify-center rounded-lg border-2 border-brand-green-600 px-6 py-3.5 text-base font-semibold text-brand-green-700 transition-colors hover:bg-brand-green-50"
            >
              Khám phá giải pháp
            </Link>
          </div>
        </div>

        <div className="relative animate-fade-up [animation-delay:120ms]">
          <PlaceholderImage
            label="Bác sĩ thú y VETJOY đồng hành cùng người chăn nuôi (chờ ảnh thật)"
            icon="stethoscope"
            aspect="aspect-[4/3] lg:aspect-square"
          />
          <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-lg ring-1 ring-neutral-200 sm:flex">
            <div className="icon-tile h-11 w-11 bg-brand-green-50 text-brand-green-700">
              <Icon name="experience" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">20+ năm</p>
              <p className="text-xs text-neutral-500">Kinh nghiệm thú y</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
