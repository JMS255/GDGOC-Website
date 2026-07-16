export default function Loading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div
        aria-hidden
        className="w-10 h-10 rounded-full animate-spin"
        style={{
          background:
            "conic-gradient(var(--gdg-blue), var(--gdg-red), var(--gdg-yellow), var(--gdg-green), var(--gdg-blue))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 4px), black calc(100% - 4px))",
        }}
      />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
