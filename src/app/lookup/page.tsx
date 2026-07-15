import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { COMMITTEE_OR_ABOVE } from "@/lib/types"

interface LookupResult {
  uid: string
  displayName: string | null
  email: string
  membershipStatus: string
  membershipTier: string
}

async function searchMembers(query: string): Promise<LookupResult[]> {
  // ~100 members — fetching and filtering in-memory is simpler and cheaper
  // than standing up a real search index for this scale, and Firestore can't
  // do case-insensitive substring queries natively anyway.
  const snapshot = await adminDb.collection("users").get()
  const needle = query.trim().toLowerCase()

  return snapshot.docs
    .map((doc) => {
      const data = doc.data()
      return {
        uid: doc.id,
        displayName: data.displayName ?? null,
        email: data.email,
        membershipStatus: data.membershipStatus,
        membershipTier: data.membershipTier,
      }
    })
    .filter(
      (member) =>
        member.displayName?.toLowerCase().includes(needle) ||
        member.email.toLowerCase().includes(needle)
    )
}

export default async function LookupPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireRole(COMMITTEE_OR_ABOVE)
  const { q } = await searchParams
  const results = q ? await searchMembers(q) : []

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Membership Lookup</h1>
      <p className="text-sm opacity-70 mb-6">Search by name or email to verify membership.</p>

      <form className="flex gap-2 mb-8">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Name or email"
          className="flex-1 border rounded px-3 py-2"
        />
        <button className="rounded-full bg-foreground text-background px-5 py-2 font-medium">
          Search
        </button>
      </form>

      {q && results.length === 0 && <p className="opacity-60">No matches found.</p>}

      {results.length > 0 && (
        <ul className="flex flex-col gap-2">
          {results.map((member) => (
            <li key={member.uid} className="border rounded-lg p-3">
              <p className="font-medium">{member.displayName ?? member.email}</p>
              <p className="text-sm opacity-60">{member.email}</p>
              <p className="text-sm mt-1 capitalize">
                {member.membershipStatus} · {member.membershipTier} tier
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
