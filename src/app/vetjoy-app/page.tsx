import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { TrackView } from "@/components/analytics/TrackView";

export const metadata: Metadata = {
  title: "VETJOY App",
  description:
    "VETJOY App — một hồ sơ sức khỏe cho mỗi vật nuôi. Đang trong quá trình phát triển.",
  alternates: { canonical: "/vetjoy-app" },
};

const features = [
  "Hồ sơ vật nuôi",
  "Hồ sơ đàn",
  "Lịch vaccine",
  "Nhắc lịch",
  "Nhật ký sức khỏe",
  "Lịch sử sử dụng sản phẩm",
  "Theo dõi chăm sóc",
  "Lưu hình ảnh",
  "Kết nối tư vấn",
  "Theo dõi sau điều trị",
];

export default function VetjoyAppPage() {
  return (
    <Container className="py-12">
      <TrackView event="app_interest" />
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <Badge tone="green">SẮP RA MẮT</Badge>
          <h1 className="mt-4 text-2xl font-bold text-neutral-900 sm:text-3xl">
            MỘT HỒ SƠ SỨC KHỎE CHO MỖI VẬT NUÔI
          </h1>
          <p className="mt-4 text-neutral-600">
            VETJOY App đang được phát triển để giúp bạn quản lý và theo dõi sức khỏe
            vật nuôi một cách liên tục — từ hồ sơ, lịch vaccine, nhật ký sức khỏe đến
            kết nối trực tiếp với đội ngũ tư vấn của VETJOY.
          </p>
        </div>
        <PlaceholderImage
          label="Minh họa giao diện VETJOY App (đang phát triển)"
          icon="app"
        />
      </div>

      <div className="mt-14">
        <h2 className="text-lg font-semibold text-neutral-900">
          Các chức năng định hướng
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700"
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
