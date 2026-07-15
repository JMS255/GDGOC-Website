import { notFound } from "next/navigation"
import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { DEPT_HEAD_OR_ABOVE } from "@/lib/types"
import { toggleCheckIn } from "./actions"

interface CheckinRow {
  rsvpId: string
  uid: string
  name: string
  attended: boolean
}

async function getCheckinRows(eventId: string): Promise<CheckinRow[]> {
  const rsvpSnapshot = await adminDb.collection("rsvps").where("eventId", "==", eventId).get()

  const rows = await Promise.all(
    rsvpSnapshot.docs.map(async (rsvpDoc) => {
      const data = rsvpDoc.data()
      const userSnapshot = await adminDb.collection("users").doc(data.uid).get()
      const userData = userSnapshot.data()
      return {
        rsvpId: rsvpDoc.id,
        uid: data.uid,
        name: userData?.displayName ?? userData?.email ?? data.uid,
        attended: data.attended,
      }
    })
  )

  return rows.sort((a, b) => a.name.localeCompare(b.name))
}

export default async function CheckinPage({
  params,
}: {
  params: Promise<{ eventId: string }>
}) {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  const { eventId } = await params

  const eventDoc = await adminDb.collection("events").doc(eventId).get()
  if (!eventDoc.exists) notFound()

  const rows = await getCheckinRows(eventId)

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">{eventDoc.data()!.title}</h1>
      <p className="text-sm opacity-60 mb-6">{rows.length} RSVP(s)</p>

      {rows.length === 0 ? (
        <p className="opacity-60">No RSVPs yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rows.map((row) => (
            <li
              key={row.rsvpId}
              className="border rounded-lg p-3 flex items-center justify-between"
            >
              <span>{row.name}</span>
              <form
                action={async () => {
                  "use server"
                  await toggleCheckIn(row.rsvpId, eventId, !row.attended)
                }}
              >
                <button
                  className={`text-sm rounded-full px-4 py-2 ${
                    row.attended ? "bg-foreground text-background" : "border"
                  }`}
                >
                  {row.attended ? "Checked in ✓" : "Check in"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
