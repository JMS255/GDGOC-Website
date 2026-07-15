import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { DEPT_HEAD_OR_ABOVE } from "@/lib/types"
import { approveMember, rejectMember } from "./actions"

interface PendingMember {
  uid: string
  email: string
  displayName: string | null
}

async function getPendingMembers(): Promise<PendingMember[]> {
  const snapshot = await adminDb.collection("users").where("membershipStatus", "==", "pending").get()
  return snapshot.docs.map((doc) => ({
    uid: doc.id,
    email: doc.data().email,
    displayName: doc.data().displayName,
  }))
}

export default async function AdminMembersPage() {
  // 403s (via forbidden()) if the signed-in user isn't a department head or above.
  await requireRole(DEPT_HEAD_OR_ABOVE)
  const pendingMembers = await getPendingMembers()

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Pending Members</h1>
      {pendingMembers.length === 0 ? (
        <p className="opacity-60">No pending applications.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {pendingMembers.map((member) => (
            <li
              key={member.uid}
              className="border rounded-lg p-4 flex items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium">{member.displayName ?? member.email}</p>
                <p className="text-sm opacity-60">{member.email}</p>
              </div>
              <div className="flex gap-2">
                <form
                  action={async () => {
                    "use server"
                    await approveMember(member.uid, "free")
                  }}
                >
                  <button className="text-sm rounded-full bg-foreground text-background px-4 py-2">
                    Approve (Free)
                  </button>
                </form>
                <form
                  action={async () => {
                    "use server"
                    await rejectMember(member.uid)
                  }}
                >
                  <button className="text-sm rounded-full border px-4 py-2">Reject</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
