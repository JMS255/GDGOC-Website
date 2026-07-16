import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { TERM_MANAGERS, type MembershipTermRecord } from "@/lib/types"
import { EmptyState } from "@/components/empty-state"
import { createTerm, activateTerm } from "./actions"

async function getTerms(): Promise<MembershipTermRecord[]> {
  const snapshot = await adminDb.collection("membershipTerms").orderBy("startDate", "desc").get()
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      label: data.label,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      isActive: data.isActive,
    }
  })
}

export default async function AdminTermsPage() {
  await requireRole(TERM_MANAGERS)
  const terms = await getTerms()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Membership Terms</h1>

      <div className="grid lg:grid-cols-[320px_1fr] gap-10">
        <form action={createTerm} className="flex flex-col gap-3">
          <input
            name="label"
            placeholder="e.g. AY 2026-2027, 1st Semester"
            className="w-full border rounded px-3 py-2"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs opacity-60">Starts</label>
              <input type="date" name="startDate" className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-xs opacity-60">Ends</label>
              <input type="date" name="endDate" className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <button
            type="submit"
            className="rounded-full bg-gdg-blue text-white px-6 py-2.5 font-medium self-start"
          >
            Create term
          </button>
        </form>

        {terms.length === 0 ? (
          <EmptyState
            title="No terms yet"
            description="Create one on the left to open renewals for members this semester."
          />
        ) : (
          <ul className="grid sm:grid-cols-2 gap-3 content-start">
            {terms.map((term) => (
              <li key={term.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {term.label} {term.isActive && <span className="text-xs">(active)</span>}
                  </p>
                  <p className="text-sm opacity-60">
                    {term.startDate.toLocaleDateString()} – {term.endDate.toLocaleDateString()}
                  </p>
                </div>
                {!term.isActive && (
                  <form
                    action={async () => {
                      "use server"
                      await activateTerm(term.id)
                    }}
                  >
                    <button className="text-sm rounded-full border px-4 py-2">Activate</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
