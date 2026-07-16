import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { DEPT_HEAD_OR_ABOVE } from "@/lib/types"
import { BackLink } from "@/components/back-link"

interface CountRow {
  label: string
  count: number
}

interface StatusRow extends CountRow {
  color: string
}

interface EventAttendanceRow {
  title: string
  rsvpCount: number
  attendedCount: number
}

const STATUS_COLORS: Record<string, string> = {
  active: "#34A853",
  pending: "#F9AB00",
  rejected: "#EA4335",
  expired: "#9AA0A6",
}

function toCountRows(values: (string | undefined)[]): CountRow[] {
  const counts = new Map<string, number>()
  for (const raw of values) {
    const value = raw?.trim() || "Unspecified"
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

async function getMembershipFunnel(): Promise<{ statusRows: StatusRow[]; tierRows: CountRow[]; total: number }> {
  const snapshot = await adminDb.collection("users").get()
  const statuses: string[] = []
  const tiers: string[] = []
  snapshot.docs.forEach((doc) => {
    statuses.push(doc.data().membershipStatus)
    tiers.push(doc.data().membershipTier)
  })

  const statusCounts = toCountRows(statuses)
  const statusRows: StatusRow[] = statusCounts.map((row) => ({
    ...row,
    color: STATUS_COLORS[row.label] ?? "#9AA0A6",
  }))

  return { statusRows, tierRows: toCountRows(tiers), total: snapshot.size }
}

async function getDemographics(): Promise<{ courseRows: CountRow[]; yearRows: CountRow[]; channelRows: CountRow[] }> {
  const snapshot = await adminDb.collection("memberProfiles").get()
  const courses: string[] = []
  const years: (string | undefined)[] = []
  const channels: string[] = []
  snapshot.docs.forEach((doc) => {
    const data = doc.data()
    courses.push(data.course)
    years.push(data.yearLevel != null ? `Year ${data.yearLevel}` : undefined)
    channels.push(data.hearAboutUs)
  })

  return {
    courseRows: toCountRows(courses),
    yearRows: toCountRows(years).sort((a, b) => a.label.localeCompare(b.label)),
    channelRows: toCountRows(channels),
  }
}

async function getEventAttendance(): Promise<EventAttendanceRow[]> {
  const [eventsSnapshot, rsvpsSnapshot] = await Promise.all([
    adminDb.collection("events").where("status", "in", ["published", "completed"]).get(),
    adminDb.collection("rsvps").get(),
  ])

  const rsvpsByEvent = new Map<string, { total: number; attended: number }>()
  rsvpsSnapshot.docs.forEach((doc) => {
    const data = doc.data()
    const current = rsvpsByEvent.get(data.eventId) ?? { total: 0, attended: 0 }
    current.total += 1
    if (data.attended) current.attended += 1
    rsvpsByEvent.set(data.eventId, current)
  })

  return eventsSnapshot.docs
    .map((doc) => {
      const stats = rsvpsByEvent.get(doc.id) ?? { total: 0, attended: 0 }
      return { title: doc.data().title, rsvpCount: stats.total, attendedCount: stats.attended }
    })
    .filter((row) => row.rsvpCount > 0)
}

function MagnitudeBar({ rows, barColor = "#4285F4" }: { rows: CountRow[]; barColor?: string }) {
  const max = Math.max(...rows.map((r) => r.count), 1)
  return (
    <ul className="flex flex-col gap-2">
      {rows.map((row) => (
        <li key={row.label} className="flex items-center gap-3 text-sm">
          <span className="w-40 shrink-0 truncate" title={row.label}>
            {row.label}
          </span>
          <div className="flex-1 h-4 rounded bg-black/5 overflow-hidden">
            <div
              className="h-full rounded"
              style={{ width: `${(row.count / max) * 100}%`, backgroundColor: barColor }}
            />
          </div>
          <span className="w-6 text-right shrink-0 opacity-70">{row.count}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function AdminAnalyticsPage() {
  await requireRole(DEPT_HEAD_OR_ABOVE)

  const [{ statusRows, tierRows, total }, { courseRows, yearRows, channelRows }, eventRows] = await Promise.all([
    getMembershipFunnel(),
    getDemographics(),
    getEventAttendance(),
  ])

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <BackLink href="/admin" label="Admin Dashboard" />
      <h1 className="text-2xl font-bold mb-1">Analytics</h1>
      <p className="text-sm opacity-70 mb-10">{total} total accounts</p>

      <section className="mb-10">
        <h2 className="font-semibold mb-3">Membership status</h2>
        <ul className="flex flex-col gap-2 max-w-2xl">
          {statusRows.map((row) => (
            <li key={row.label} className="flex items-center gap-3 text-sm">
              <span className="w-20 shrink-0 capitalize">{row.label}</span>
              <div className="flex-1 h-4 rounded bg-black/5 overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{ width: `${(row.count / total) * 100}%`, backgroundColor: row.color }}
                />
              </div>
              <span className="w-6 text-right shrink-0 opacity-70">{row.count}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="grid md:grid-cols-2 gap-x-10 gap-y-10">
        <section>
          <h2 className="font-semibold mb-3">Membership tier</h2>
          <MagnitudeBar rows={tierRows} />
        </section>

        <section>
          <h2 className="font-semibold mb-3">Course</h2>
          {courseRows.length === 0 ? <p className="text-sm opacity-60">No profile data yet.</p> : <MagnitudeBar rows={courseRows} />}
        </section>

        <section>
          <h2 className="font-semibold mb-3">Year level</h2>
          {yearRows.length === 0 ? <p className="text-sm opacity-60">No profile data yet.</p> : <MagnitudeBar rows={yearRows} />}
        </section>

        <section>
          <h2 className="font-semibold mb-3">How members heard about GDGoC</h2>
          {channelRows.length === 0 ? (
            <p className="text-sm opacity-60">No profile data yet.</p>
          ) : (
            <MagnitudeBar rows={channelRows} />
          )}
        </section>
      </div>

      <section className="mt-10">
        <h2 className="font-semibold mb-3">Event attendance</h2>
        {eventRows.length === 0 ? (
          <p className="text-sm opacity-60">No events with RSVPs yet.</p>
        ) : (
          <ul className="grid md:grid-cols-2 gap-x-10 gap-y-3">
            {eventRows.map((event) => {
              const rate = event.rsvpCount > 0 ? Math.round((event.attendedCount / event.rsvpCount) * 100) : 0
              return (
                <li key={event.title} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{event.title}</span>
                    <span className="opacity-70">
                      {event.attendedCount}/{event.rsvpCount} attended ({rate}%)
                    </span>
                  </div>
                  <div className="h-4 rounded bg-black/5 overflow-hidden">
                    <div
                      className="h-full rounded bg-gdg-green"
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
