import Link from "next/link"
import { adminDb } from "@/lib/firebase/admin"
import { getOptionalUser } from "@/lib/dal"
import { rsvpToEvent } from "./actions"

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

async function getRsvpedEventIds(uid: string): Promise<Set<string>> {
  const snapshot = await adminDb.collection("rsvps").where("uid", "==", uid).get()
  return new Set(snapshot.docs.map((doc) => doc.data().eventId))
}

export default async function EventsPage() {
  const [events, user] = await Promise.all([getPublishedEvents(), getOptionalUser()])
  const rsvpedEventIds = user ? await getRsvpedEventIds(user.uid) : new Set<string>()

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-6">Events</h1>
      {events.length === 0 ? (
        <p className="opacity-70">No events published yet — check back soon.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {events.map((event) => {
            const hasRsvped = rsvpedEventIds.has(event.id)
            return (
              <li key={event.id} className="border border-black/10 dark:border-white/15 rounded-lg p-4">
                <h2 className="font-semibold">{event.title}</h2>
                <p className="text-sm opacity-70">
                  {event.startsAt} · {event.location}
                </p>
                <p className="mt-2 text-sm">{event.description}</p>

                <div className="mt-3">
                  {!user && (
                    <Link href="/login" className="text-sm underline">
                      Sign in to RSVP
                    </Link>
                  )}
                  {user && user.membershipStatus !== "active" && (
                    <p className="text-sm opacity-60">Active membership required to RSVP.</p>
                  )}
                  {user && user.membershipStatus === "active" && hasRsvped && (
                    <p className="text-sm font-medium">You&apos;re going ✓</p>
                  )}
                  {user && user.membershipStatus === "active" && !hasRsvped && (
                    <form
                      action={async () => {
                        "use server"
                        await rsvpToEvent(event.id)
                      }}
                    >
                      <button className="text-sm rounded-full bg-foreground text-background px-4 py-2">
                        RSVP
                      </button>
                    </form>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
