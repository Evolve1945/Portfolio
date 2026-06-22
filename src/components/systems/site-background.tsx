// Swappable decorative background. Change BACKGROUND to restyle the whole site
// in one place. Variants:
//   "soft"  — faint dot field + a gentle accent glow (recommended)
//   "dots"  — dot field only
//   "grid"  — the original line grid
//   "glow"  — accent glow only (softest)
//   "none"  — solid colour, no decoration
type Variant = "soft" | "dots" | "grid" | "glow" | "none";

export const BACKGROUND: Variant = "soft";

export function SiteBackground({
  variant = BACKGROUND,
  className = "",
}: {
  variant?: Variant;
  className?: string;
}) {
  if (variant === "none") return null;

  const showDots = variant === "dots" || variant === "soft";
  const showGrid = variant === "grid";
  const showGlow = variant === "glow" || variant === "soft";

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      aria-hidden
    >
      {showGrid ? <div className="grid-bg absolute inset-0 opacity-50" /> : null}
      {showDots ? <div className="dot-bg absolute inset-0 opacity-70" /> : null}
      {showGlow ? (
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/10 blur-3xl sm:h-96 sm:w-96" />
      ) : null}
    </div>
  );
}
