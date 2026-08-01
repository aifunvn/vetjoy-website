import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon, type IconName } from "@/components/ui/Icon";

const problems: { label: string; href: string; icon: IconName }[] = [
  {
    label: "Vật nuôi đang có biểu hiện bất thường",
    href: "/giai-phap/van-nuoi-co-van-de",
    icon: "alert",
  },
  { label: "Tôi cần phòng bệnh", href: "/giai-phap/phong-benh", icon: "shield-check" },
  { label: "Tôi cần vaccine", href: "/giai-phap/vaccine", icon: "syringe" },
  { label: "Tôi cần dinh dưỡng", href: "/giai-phap/dinh-duong", icon: "leaf" },
  {
    label: "Tôi cần sát trùng chuồng trại",
    href: "/giai-phap/an-toan-sinh-hoc",
    icon: "spray",
  },
  { label: "Tôi cần chăm sóc thú cưng", href: "/giai-phap/cham-soc-thu-cung", icon: "paw" },
  { label: "Tôi cần tư vấn trang trại", href: "/giai-phap/quan-ly-trang-trai", icon: "barn" },
  { label: "Tôi muốn trở thành đại lý", href: "/dai-ly", icon: "handshake" },
];

export function ProblemSection() {
  return (
    <section className="section-py">
      <Container>
        <SectionHeading title="BẠN ĐANG GẶP VẤN ĐỀ GÌ?" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem) => (
            <Link
              key={problem.href}
              href={problem.href}
              className="focus-ring card-vj card-vj-hover group flex h-full flex-col justify-between p-5 hover:border-brand-green-300"
            >
              <div className="icon-tile h-11 w-11 bg-brand-green-50 text-brand-green-700 transition-colors group-hover:bg-brand-green-600 group-hover:text-white">
                <Icon name={problem.icon} className="h-5 w-5" />
              </div>
              <p className="mt-4 text-sm font-semibold text-neutral-800 group-hover:text-brand-green-700">
                {problem.label}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-teal-600">
                Xem giải pháp
                <Icon
                  name="arrow-right"
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
