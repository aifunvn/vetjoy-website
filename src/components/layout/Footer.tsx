import Link from "next/link";
import { footerNav, primaryNav, siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Container";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import { SocialIconLink } from "@/components/ui/SocialIconLink";
import { PlaceholderImage } from "@/components/ui/PlaceholderImage";
import { Icon } from "@/components/ui/Icon";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-lg font-extrabold text-brand-green-700">
            {siteConfig.brandName}
          </p>
          <p className="mt-2 text-sm text-neutral-600">{siteConfig.slogan}</p>
          <p className="mt-4 text-sm text-neutral-500">{siteConfig.companyName}</p>

          <div className="mt-5 flex items-center gap-2">
            <SocialIconLink href={siteConfig.social.facebook} icon="facebook" label="Facebook VETJOY" />
            <SocialIconLink href={siteConfig.social.youtube} icon="youtube" label="YouTube VETJOY" />
            <SocialIconLink href={siteConfig.social.tiktok} icon="tiktok" label="TikTok VETJOY" />
            <SocialIconLink href={siteConfig.social.zalo} icon="zalo" label="Zalo OA VETJOY" />
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-800">Điều hướng</p>
          <ul className="mt-3 space-y-2">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="focus-ring text-sm text-neutral-600 hover:text-brand-green-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-800">Thông tin</p>
          <ul className="mt-3 space-y-2">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="focus-ring text-sm text-neutral-600 hover:text-brand-green-700"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold text-neutral-800">Liên hệ</p>
          <ul className="mt-3 space-y-2.5 text-sm text-neutral-600">
            <li className="flex items-start gap-2">
              <Icon name="map-pin" className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
              <span>{siteConfig.contact.addressPlaceholder}</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="phone" className="h-4 w-4 shrink-0 text-neutral-400" />
              <TrackedLink
                event="phone_click"
                href={siteConfig.contact.phoneHref}
                className="focus-ring hover:text-brand-green-700"
              >
                {siteConfig.contact.phoneDisplay}
              </TrackedLink>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="message-circle" className="h-4 w-4 shrink-0 text-neutral-400" />
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="focus-ring hover:text-brand-green-700"
              >
                {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="clock" className="h-4 w-4 shrink-0 text-neutral-400" />
              <span>{siteConfig.contact.workingHoursPlaceholder}</span>
            </li>
          </ul>
        </div>
      </Container>

      <Container className="pb-12">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_260px] sm:items-center">
          <p className="text-xs text-neutral-500">
            PLACEHOLDER: Bản đồ Google Maps sẽ hiển thị khi có địa chỉ trụ sở chính
            thức được xác nhận.
          </p>
          <PlaceholderImage
            label="Google Maps"
            icon="map-pin"
            aspect="aspect-[16/9]"
            className="sm:aspect-[4/2]"
          />
        </div>
      </Container>

      <div className="border-t border-neutral-200 py-6">
        <Container className="flex flex-col items-center justify-between gap-2 text-xs text-neutral-500 sm:flex-row">
          <p>
            © {year} {siteConfig.companyName}. Đã đăng ký bản quyền thương hiệu{" "}
            {siteConfig.brandName}.
          </p>
          <p>PLACEHOLDER: Thông tin đăng ký kinh doanh cần Founder xác nhận.</p>
        </Container>
      </div>
    </footer>
  );
}
