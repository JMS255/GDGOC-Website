import Link from "next/link"

export default function Unauthorized() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-2">401 — Please sign in</h1>
      <p className="opacity-70 mb-6">You need to be signed in to view this page.</p>
      <Link href="/login" className="rounded-full bg-gdg-blue text-white px-6 py-3 font-medium">
        Sign in
      </Link>
    </div>
  )
}
