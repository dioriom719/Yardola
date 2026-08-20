import { cn } from "@/lib/utils";

/**
 * YARDOLO brand mark system. Single source of truth for the wordmark,
 * tagline, and Y icon -- every place the brand appears (nav, footer,
 * favicon/app icons, auth screens) renders through these components
 * rather than typing "Yardolo" text beside a hand-picked icon.
 *
 * The Y + terracotta arc geometry here (`MarkPaths`) is shared by every
 * export so the mark itself never drifts between contexts -- only color
 * (`tone`) and framing (`badge`) vary. Every consumer nests it as its own
 * `<svg viewBox="0 0 100 100">` sized/positioned via x/y/width/height, so
 * layout math never has to fight the mark's internal coordinates.
 */

const BRAND_TAGLINE = "YOUR BACKYARD STARTS HERE.";
const FONT_FAMILY = "var(--font-manrope), sans-serif";

interface MarkColors {
  y: string;
  arc: string;
}

const TONE_COLORS: Record<"brand" | "light", MarkColors> = {
  // Default: dark evergreen Y, terracotta arc -- for light/ivory surfaces.
  brand: { y: "#173B35", arc: "#C87555" },
  // For placing the mark on a dark (evergreen) surface.
  light: { y: "#FAF9F5", arc: "#C87555" },
};

function MarkPaths({ colors }: { colors: MarkColors }) {
  return (
    <>
      <path
        d="M 24 18 L 50 46 L 76 18"
        stroke={colors.y}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M 50 46 L 50 66"
        stroke={colors.y}
        strokeWidth="11"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 20 80 Q 50 96 80 80"
        stroke={colors.arc}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
    </>
  );
}

/** Nestable icon graphic (no outer <svg>) -- positioned by the parent via x/y/width/height. */
function Mark({
  x,
  y,
  size,
  colors,
  badge,
}: {
  x: number;
  y: number;
  size: number;
  colors: MarkColors;
  badge?: boolean;
}) {
  return (
    <svg x={x} y={y} width={size} height={size} viewBox="0 0 100 100">
      {badge && <circle cx="50" cy="50" r="48" fill="#FAF9F5" />}
      <MarkPaths colors={colors} />
    </svg>
  );
}

export interface YardoloIconProps {
  className?: string;
  /** Icon color treatment. "brand" (default) is for light surfaces; "light" is for dark evergreen surfaces. */
  tone?: "brand" | "light";
  /** Wraps the mark in its ivory circle badge -- used for the favicon/app icon and standalone avatar-style placements. */
  badge?: boolean;
}

/** The YARDOLO icon-only mark: the stylized Y with its terracotta arc. */
export function YardoloIcon({
  className,
  tone = "brand",
  badge = false,
}: YardoloIconProps) {
  const colors = TONE_COLORS[tone];
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="YARDOLO"
      className={cn("size-8", className)}
    >
      {badge && <circle cx="50" cy="50" r="48" fill="#FAF9F5" />}
      <MarkPaths colors={colors} />
    </svg>
  );
}

export interface YardoloLogoProps {
  className?: string;
  /** "horizontal": icon beside the wordmark(+tagline) -- needs more width. "stacked": icon above a centered wordmark+tagline -- needs more height, less width. */
  variant?: "horizontal" | "stacked";
  /** Set false to render the wordmark without the "YOUR BACKYARD STARTS HERE." tagline, e.g. in cramped headers. Stacked always shows it. */
  showTagline?: boolean;
  tone?: "brand" | "light";
}

/** The full YARDOLO lockup: icon + wordmark (+ tagline). */
export function YardoloLogo({
  className,
  variant = "horizontal",
  showTagline = true,
  tone = "brand",
}: YardoloLogoProps) {
  const colors = TONE_COLORS[tone];

  if (variant === "stacked") {
    return (
      <svg
        viewBox="0 0 220 152"
        role="img"
        aria-label="YARDOLO -- Your Backyard Starts Here."
        className={cn("h-28 w-auto", className)}
      >
        <Mark x={82} y={4} size={56} colors={colors} />
        <text
          x="110"
          y="100"
          textAnchor="middle"
          fontFamily={FONT_FAMILY}
          fontWeight="800"
          fontSize="26"
          letterSpacing="1"
          fill={colors.y}
        >
          YARDOLO
        </text>
        <text
          x="110"
          y="124"
          textAnchor="middle"
          fontFamily={FONT_FAMILY}
          fontWeight="700"
          fontSize="10"
          letterSpacing="2"
          fill={colors.arc}
        >
          {BRAND_TAGLINE}
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox={showTagline ? "0 0 380 72" : "0 0 300 56"}
      role="img"
      aria-label="YARDOLO -- Your Backyard Starts Here."
      className={cn("h-10 w-auto", className)}
    >
      <Mark x={0} y={2} size={52} colors={colors} />
      <text
        x="66"
        y={showTagline ? "34" : "36"}
        fontFamily={FONT_FAMILY}
        fontWeight="800"
        fontSize="28"
        letterSpacing="1"
        fill={colors.y}
      >
        YARDOLO
      </text>
      {showTagline && (
        <text
          x="67"
          y="56"
          fontFamily={FONT_FAMILY}
          fontWeight="700"
          fontSize="10"
          letterSpacing="1.5"
          fill={colors.arc}
        >
          {BRAND_TAGLINE}
        </text>
      )}
    </svg>
  );
}
