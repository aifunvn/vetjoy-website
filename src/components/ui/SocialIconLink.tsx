import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Renders a real link only when `href` is provided. When it's null
 * (no Founder-confirmed URL yet), renders a visibly disabled placeholder
 * instead of pointing anywhere — per "không tự tạo link thật".
 */
export function SocialIconLink({
  href,
  icon,
  label,
}: {
  href: string | null;
  icon: IconName;
  label: string;
}) {
  if (!href) {
    return (
      <span
        aria-disabled="true"
        title={`${label} — chưa cập nhật`}
        className="icon-tile h-9 w-9 cursor-not-allowed bg-neutral-100 text-neutral-300"
      >
        <Icon name={icon} className="h-4 w-4" />
      </span>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="focus-ring icon-tile h-9 w-9 bg-neutral-100 text-neutral-600 transition-colors hover:bg-brand-green-600 hover:text-white"
    >
      <Icon name={icon} className="h-4 w-4" />
    </a>
  );
}
