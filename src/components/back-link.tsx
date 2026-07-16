import Link from "next/link"

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm opacity-70 hover:opacity-100 hover:text-gdg-blue transition mb-4"
    >
      ← {label}
    </Link>
  )
}
