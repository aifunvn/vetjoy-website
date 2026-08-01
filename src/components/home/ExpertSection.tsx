import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { DemoDataBadge } from "@/components/ui/Badge";
import { Icon, type IconName } from "@/components/ui/Icon";

const credentials: { icon: IconName; label: string }[] = [
  { icon: "experience", label: "Tên bác sĩ" },
  { icon: "clipboard", label: "Bằng cấp / chứng chỉ" },
  { icon: "shield-check", label: "Thành tích" },
  { icon: "heartbeat", label: "Số khách hàng đã hỗ trợ" },
];

export function ExpertSection() {
  return (
    <section className="section-py border-y border-neutral-200 bg-neutral-50">
      <Container className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <PlaceholderImage
            label="Bác sĩ thú y VETJOY (chờ Founder cung cấp ảnh thật)"
            icon="stethoscope"
            aspect="aspect-[4/3]"
          />
        </div>
        <div>
          <SectionHeading
            align="left"
            eyebrow="Đội ngũ chuyên môn"
            title="HƠN 20 NĂM KINH NGHIỆM THÚ Y"
          />
          <p className="mt-4 text-neutral-600">
            Đội ngũ VETJOY được dẫn dắt bởi bác sĩ thú y với hơn 20 năm kinh nghiệm
            thực tế trong ngành, đồng hành cùng người chăn nuôi từ hộ gia đình đến
            trang trại quy mô lớn.
          </p>

          <div className="mt-6 card-vj p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-neutral-800">
                Thông tin bác sĩ
              </p>
              <DemoDataBadge />
            </div>
            <ul className="divide-y divide-neutral-100">
              {credentials.map((c) => (
                <li key={c.label} className="flex items-center gap-3 py-2.5">
                  <div className="icon-tile h-9 w-9 bg-brand-green-50 text-brand-green-700">
                    <Icon name={c.icon} className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{c.label}</p>
                    <p className="text-xs text-neutral-400">
                      PLACEHOLDER — chờ Founder cung cấp
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
