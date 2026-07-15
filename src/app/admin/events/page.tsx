import Link from "next/link"
import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { DEPT_HEAD_OR_ABOVE, type EventRecord } from "@/lib/types"
import { EventForm } from "./event-form"
import { publishEvent, cancelEvent } from "./actions"

async function getAllEvents(): Promise<EventRecord[]> {
  const snapshot = await adminDb.collection("events").orderBy("startsAt", "desc").get()
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      department: data.department,
      location: data.location,
      startsAt: data.startsAt.toDate(),
      endsAt: data.endsAt.toDate(),
      status: data.status,
    }
  })
}

export default async function AdminEventsPage() {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  const events = await getAllEvents()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Events</h1>
      <div className="grid lg:grid-cols-[320px_1fr] gap-10">
        <EventForm />

        <ul className="grid sm:grid-cols-2 gap-3 content-start">
          {events.map((event) => (
            <li key={event.id} className="border rounded-lg p-4">
              <p className="font-medium">
                {event.title} <span className="text-xs opacity-60">({event.status})</span>
              </p>
              <p className="text-sm opacity-60 mb-3">
                {event.startsAt.toLocaleString()} · {event.location}
              </p>
              <div className="flex gap-2">
                {event.status === "draft" && (
                  <form
                    action={async () => {
                      "use server"
                      await publishEvent(event.id)
                    }}
                  >
                    <button className="text-sm rounded-full bg-gdg-blue text-white px-4 py-2">
                      Publish
                    </button>
                  </form>
                )}
                {event.status === "published" && (
                  <>
                    <Link
                      href={`/admin/events/${event.id}/checkin`}
                      className="text-sm rounded-full border px-4 py-2"
                    >
                      Check-in
                    </Link>
                    <form
                      action={async () => {
                        "use server"
                        await cancelEvent(event.id)
                      }}
                    >
                      <button className="text-sm rounded-full border px-4 py-2">Cancel</button>
                    </form>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
