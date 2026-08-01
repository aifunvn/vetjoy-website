import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Icon, type IconName } from "@/components/ui/Icon";

const reasons: { icon: IconName; title: string; desc: string }[] = [
  {
    icon: "stethoscope",
    title: "Bác sĩ hơn 20 năm kinh nghiệm",
    desc: "Đội ngũ chuyên môn thực chiến, hiểu rõ điều kiện chăn nuôi thực tế tại Việt Nam.",
  },
  {
    icon: "heartbeat",
    title: "Đồng hành sau bán",
    desc: "Không dừng lại sau khi bán sản phẩm — VETJOY theo dõi và hỗ trợ suốt quá trình.",
  },
  {
    icon: "chat",
    title: "Tư vấn chuyên môn",
    desc: "Được hướng dẫn rõ ràng: dùng gì, tại sao, dùng thế nào và theo dõi ra sao.",
  },
  {
    icon: "app",
    title: "VETJOY App",
    desc: "Hồ sơ sức khỏe vật nuôi, lịch vaccine và nhắc lịch chăm sóc trong một ứng dụng.",
  },
  {
    icon: "box",
    title: "Sản phẩm đa dạng",
    desc: "Thuốc thú y, vaccine, dinh dưỡng, chế phẩm sinh học và dụng cụ trong một hệ thống.",
  },
  {
    icon: "shield-check",
    title: "Giải pháp toàn diện",
    desc: "Từ phòng bệnh, an toàn sinh học đến quản lý trang trại — không chỉ bán một sản phẩm đơn lẻ.",
  },
];

export function WhyVetjoySection() {
  return (
    <section className="section-py bg-neutral-50">
      <Container>
        <SectionHeading eyebrow="Vì sao chọn VETJOY" title="TẠI SAO CHỌN VETJOY" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => (
            <div key={reason.title} className="card-vj card-vj-hover p-6">
              <div className="icon-tile h-12 w-12 bg-brand-green-50 text-brand-green-700">
                <Icon name={reason.icon} className="h-6 w-6" />
              </div>
              <p className="mt-4 font-semibold text-neutral-900">{reason.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {reason.desc}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
