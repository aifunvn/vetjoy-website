import { Icon, type IconName } from "@/components/ui/Icon";

/**
 * Stand-in for real photography (vets, farms, products, customers) that the
 * Founder has not yet supplied. Deliberately styled as an illustrated
 * placeholder (icon + gradient) rather than a gray box, but the "Hình ảnh
 * minh họa" tag keeps it from ever reading as a real photo.
 */
export function PlaceholderImage({
  label,
  icon = "paw",
  className = "",
  aspect = "aspect-[4/3]",
}: {
  label: string;
  icon?: IconName;
  className?: string;
  aspect?: string;
}) {
  return (
    <div
      className={`relative flex ${aspect} w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-green-50 via-neutral-50 to-brand-teal-50 p-6 text-center ${className}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "18px 18px",
          color: "var(--color-brand-green-200)",
        }}
      />
      <span className="absolute left-3 top-3 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-medium text-neutral-500 backdrop-blur-sm">
        Hình ảnh minh họa
      </span>
      <div className="relative flex flex-col items-center gap-3">
        <div className="icon-tile h-16 w-16 bg-white text-brand-green-600 shadow-sm">
          <Icon name={icon} className="h-8 w-8" />
        </div>
        <span className="max-w-[26ch] text-sm text-neutral-500">{label}</span>
      </div>
    </div>
  );
}
