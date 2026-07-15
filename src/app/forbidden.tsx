import Link from "next/link"

export default function Forbidden() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-2">403 — Not allowed</h1>
      <p className="opacity-70 mb-6">
        You&apos;re signed in, but your role doesn&apos;t have access to this page.
      </p>
      <Link href="/dashboard" className="rounded-full bg-gdg-blue text-white px-6 py-3 font-medium">
        Back to dashboard
      </Link>
    </div>
  )
}
