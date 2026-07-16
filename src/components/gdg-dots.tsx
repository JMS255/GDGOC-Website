const DOT_COLORS = ["var(--gdg-blue)", "var(--gdg-red)", "var(--gdg-yellow)", "var(--gdg-green)"]

/** The four-color dot motif used across GDG chapter branding. */
export function GdgDots() {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {DOT_COLORS.map((color, i) => (
        <span
          key={color}
          className="gdg-dot w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: color, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}
