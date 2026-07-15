import Link from "next/link"
import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { DEPT_HEAD_OR_ABOVE } from "@/lib/types"

interface MemberSummary {
  uid: string
  email: string
  displayName: string | null
}

async function getActiveMembers(): Promise<MemberSummary[]> {
  const snapshot = await adminDb.collection("users").where("membershipStatus", "==", "active").get()
  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    email: doc.data().email,
    displayName: doc.data().displayName,
  }))
}

export default async function AdminMembersPage() {
  // 403s (via forbidden()) if the signed-in user isn't a department head or above.
  await requireRole(DEPT_HEAD_OR_ABOVE)
  const activeMembers = await getActiveMembers()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Members</h1>
        <Link href="/admin/applications" className="text-sm underline">
          Review applications →
        </Link>
      </div>

      {activeMembers.length === 0 ? (
        <p className="opacity-60">No active members yet.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {activeMembers.map((member) => (
            <li key={member.uid}>
              <Link
                href={`/admin/members/${member.uid}`}
                className="border rounded-lg p-3 flex items-center justify-between hover:bg-black/5"
              >
                <span className="font-medium">{member.displayName ?? member.email}</span>
                <span className="text-sm opacity-60">{member.email}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
