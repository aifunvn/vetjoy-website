import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-brand-teal-700 py-16 text-white sm:py-20">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          color: "rgba(255,255,255,0.08)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-brand-green-500/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-white/10 blur-3xl"
      />
      <Container className="relative text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
          <Icon name="chat" className="h-6 w-6" />
        </div>
        <h2 className="mt-5 text-2xl font-bold sm:text-3xl">
          BẠN CHƯA BIẾT NÊN BẮT ĐẦU TỪ ĐÂU?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-white/80">
          Hãy cho VETJOY biết tình trạng vật nuôi của bạn — đội ngũ bác sĩ thú y sẽ
          xem xét và tư vấn hướng xử lý phù hợp.
        </p>
        <Link
          href="/tu-van-bac-si"
          className="focus-ring mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-7 py-3.5 text-base font-semibold text-brand-teal-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-teal-50"
        >
          Gửi tình trạng cho VETJOY
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      </Container>
    </section>
  );
}
