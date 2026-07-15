const DOT_COLORS = ["var(--gdg-blue)", "var(--gdg-red)", "var(--gdg-yellow)", "var(--gdg-green)"]

/** The four-color dot motif used across GDG chapter branding. */
export function GdgDots() {
  return (
    <span className="inline-flex gap-0.5" aria-hidden>
      {DOT_COLORS.map((color) => (
        <span
          key={color}
          className="w-2 h-2 rounded-full inline-block"
          style={{ backgroundColor: color }}
        />
      ))}
    </span>
  )
}
