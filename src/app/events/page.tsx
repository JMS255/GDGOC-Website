import { adminDb } from "@/lib/firebase/admin"

interface EventListItem {
  id: string
  title: string
  description: string
  startsAt: string
  location: string
}

async function getPublishedEvents(): Promise<EventListItem[]> {
  const snapshot = await adminDb
    .collection("events")
    .where("status", "==", "published")
    .orderBy("startsAt", "asc")
    .get()

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      title: data.title,
      description: data.description,
      startsAt: data.startsAt.toDate().toLocaleString(),
      location: data.location,
    }
  })
}

export default async function EventsPage() {
  const events = await getPublishedEvents()

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Events</h1>
      {events.length === 0 ? (
        <p className="opacity-70">No events published yet — check back soon.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {events.map((event) => (
            <li key={event.id} className="border border-black/10 dark:border-white/15 rounded-lg p-4">
              <h2 className="font-semibold">{event.title}</h2>
              <p className="text-sm opacity-70">
                {event.startsAt} · {event.location}
              </p>
              <p className="mt-2 text-sm">{event.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
