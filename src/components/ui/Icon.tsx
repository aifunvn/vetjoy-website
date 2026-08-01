import type { SVGAttributes } from "react";

/**
 * Small hand-authored icon set (no icon-library dependency). Every icon
 * shares the same 24x24 stroke grammar so the set reads as one system
 * across sections. Add new names here rather than introducing a package.
 */
export type IconName =
  | "experience"
  | "stethoscope"
  | "heartbeat"
  | "app"
  | "chat"
  | "box"
  | "shield-check"
  | "alert"
  | "syringe"
  | "leaf"
  | "spray"
  | "paw"
  | "barn"
  | "handshake"
  | "clipboard"
  | "search"
  | "lightbulb"
  | "activity"
  | "bell"
  | "flask"
  | "toolbox"
  | "pill"
  | "facebook"
  | "youtube"
  | "tiktok"
  | "zalo"
  | "map-pin"
  | "clock"
  | "phone"
  | "message-circle"
  | "arrow-right"
  | "close"
  | "plus";

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function paths(name: IconName) {
  switch (name) {
    case "experience":
      return (
        <>
          <circle cx="12" cy="9" r="5.25" />
          <path d="M8.5 13.5 7 21l5-2.5 5 2.5-1.5-7.5" />
        </>
      );
    case "stethoscope":
      return (
        <>
          <path d="M6 3v6a4 4 0 0 0 8 0V3" />
          <path d="M10 13v2a5 5 0 0 0 10 0v-2.5" />
          <circle cx="20" cy="10.5" r="1.75" />
        </>
      );
    case "heartbeat":
      return <path d="M3 12h4l1.5-3L11 17l2.5-8L15 12h6" />;
    case "app":
      return (
        <>
          <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
          <path d="M11 18.5h2" />
        </>
      );
    case "chat":
      return (
        <path d="M4 5h16v11H9l-4 4v-4H4Z M8 9.5h8 M8 12.5h5" />
      );
    case "box":
      return (
        <>
          <path d="M3.5 7.5 12 3l8.5 4.5L12 12 3.5 7.5Z" />
          <path d="M3.5 7.5V16l8.5 4.5V12M20.5 7.5V16L12 20.5" />
        </>
      );
    case "shield-check":
      return (
        <>
          <path d="M12 3 4.5 5.5v5.7c0 4.6 3.2 7.9 7.5 9.3 4.3-1.4 7.5-4.7 7.5-9.3V5.5Z" />
          <path d="m9 12 2 2 4-4" />
        </>
      );
    case "alert":
      return (
        <>
          <path d="M12 3.5 2.5 20h19L12 3.5Z" />
          <path d="M12 10v4" />
          <path d="M12 17h.01" />
        </>
      );
    case "syringe":
      return (
        <path d="m19 3 2 2-2.5 2.5M18 4.5l-9 9M6 17l-2.5 2.5M9 20l2-2M4.5 15.5 8.5 19.5M9 9l6 6M11.5 6.5l6 6" />
      );
    case "leaf":
      return (
        <path d="M5 19c8 0 13-5 13-13V5h-1C9 5 5 9 5 17Z M5 19c2-4 5-7 9-9" />
      );
    case "spray":
      return (
        <>
          <path d="M9 8V4h4v4" />
          <path d="M7 8h8l1 12H6Z" />
          <path d="M3 10h1.5M3 13h1.5M3 16h1.5" />
        </>
      );
    case "paw":
      return (
        <>
          <circle cx="7" cy="8" r="1.6" />
          <circle cx="12" cy="6" r="1.6" />
          <circle cx="17" cy="8" r="1.6" />
          <circle cx="19" cy="12.5" r="1.6" />
          <path d="M12 12c-3 0-5.5 2-5.5 4.5S8.5 20.5 12 20.5s5.5-1.5 5.5-4S15 12 12 12Z" />
        </>
      );
    case "barn":
      return (
        <>
          <path d="M3 21V10l9-6 9 6v11" />
          <path d="M3 10h18M9 21v-6h6v6" />
        </>
      );
    case "handshake":
      return (
        <path d="M3 12h4l2.5-2.5L12 12l3-3 3 3h3M9 12l-2.5 3M15 12l2.5 3" />
      );
    case "clipboard":
      return (
        <>
          <rect x="5.5" y="4.5" width="13" height="16" rx="2" />
          <path d="M9 4.5V3.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
          <path d="M9 11h6M9 15h6" />
        </>
      );
    case "search":
      return (
        <>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4-4" />
        </>
      );
    case "lightbulb":
      return (
        <>
          <path d="M9 18h6M10 21h4" />
          <path d="M12 3a6.5 6.5 0 0 0-3.8 11.8c.5.4.8 1 .8 1.7v.5h6v-.5c0-.7.3-1.3.8-1.7A6.5 6.5 0 0 0 12 3Z" />
        </>
      );
    case "activity":
      return <path d="M3 12h4l2-7 4 14 2-7h6" />;
    case "bell":
      return (
        <>
          <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </>
      );
    case "flask":
      return (
        <>
          <path d="M10 3v6L4.5 19a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L14 9V3" />
          <path d="M9 3h6M7 16h10" />
        </>
      );
    case "toolbox":
      return (
        <>
          <rect x="3" y="9" width="18" height="10" rx="2" />
          <path d="M8 9V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3M3 13h18" />
        </>
      );
    case "pill":
      return (
        <>
          <rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-35 12 12)" />
          <path d="m10 8 4 8" />
        </>
      );
    case "facebook":
      return <path d="M14 21v-7h2.5l.5-3H14V9c0-.9.3-1.5 1.7-1.5H17V4.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.7 1.4-3.7 3.9V11H8.5v3H11v7Z" />;
    case "youtube":
      return (
        <>
          <rect x="3" y="6.5" width="18" height="11" rx="3" />
          <path d="m10.5 9.5 5 2.5-5 2.5Z" fill="currentColor" stroke="none" />
        </>
      );
    case "tiktok":
      return (
        <path d="M13 3v11.5a3 3 0 1 1-2.5-2.96M13 3c.4 2.2 2 3.9 4 4.3V10c-1.5 0-2.9-.5-4-1.3" />
      );
    case "zalo":
      return (
        <>
          <rect x="3" y="4" width="18" height="14" rx="4" />
          <path d="M7.5 15v-6l4 6v-6M13.5 9h4l-4 6h4" />
        </>
      );
    case "map-pin":
      return (
        <>
          <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.25" />
        </>
      );
    case "clock":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </>
      );
    case "phone":
      return (
        <path d="M5 4h3.5l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V17.5c0 1-1 1.5-1.5 1.5C10.5 19 5 13.5 5 6.5 5 6 5.4 4 5 4Z" />
      );
    case "message-circle":
      return (
        <path d="M21 11.5a8.5 8.5 0 1 1-3.8-7.1L21 3.5l-1 3.6a8.4 8.4 0 0 1 1 4.4Z" />
      );
    case "arrow-right":
      return <path d="M4 12h15M13 6l6 6-6 6" />;
    case "close":
      return <path d="M6 6l12 12M18 6 6 18" />;
    case "plus":
      return <path d="M12 5v14M5 12h14" />;
    default:
      return null;
  }
}

export function Icon({
  name,
  className = "h-6 w-6",
  ...props
}: { name: IconName } & SVGAttributes<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...strokeProps} {...props}>
      {paths(name)}
    </svg>
  );
}
