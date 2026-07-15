import Link from "next/link"
import { requireActiveMember } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { LogoutButton } from "@/components/logout-button"

interface Announcement {
  id: string
  title: string
  body: string
}

interface OrgKpi {
  id: string
  label: string
  value: string
}

interface OwnResponsibility {
  id: string
  title: string
  dueDate: string | null
}

interface LatestReview {
  rating: number
  note: string
}

async function getAnnouncements(): Promise<Announcement[]> {
  const snapshot = await adminDb
    .collection("announcements")
    .orderBy("createdAt", "desc")
    .limit(5)
    .get()
  return snapshot.docs.map((doc) => ({ id: doc.id, title: doc.data().title, body: doc.data().body }))
}

async function getOrgKpis(): Promise<OrgKpi[]> {
  const snapshot = await adminDb.collection("orgKpis").get()
  return snapshot.docs.map((doc) => ({ id: doc.id, label: doc.data().label, value: doc.data().value }))
}

async function getOwnOpenResponsibilities(uid: string): Promise<OwnResponsibility[]> {
  const snapshot = await adminDb
    .collection("responsibilities")
    .where("assignedTo", "==", uid)
    .where("status", "==", "assigned")
    .get()
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    title: doc.data().title,
    dueDate: doc.data().dueDate ? doc.data().dueDate.toDate().toLocaleDateString() : null,
  }))
}

async function getLatestReview(uid: string): Promise<LatestReview | null> {
  const snapshot = await adminDb
    .collection("performanceReviews")
    .where("uid", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(1)
    .get()
  if (snapshot.empty) return null
  const data = snapshot.docs[0].data()
  return { rating: data.rating, note: data.note }
}

export default async function DashboardPage() {
  // This page requires an authenticated, active member — the check lives
  // here (not in a shared layout) per Next.js's DAL recommendation, since
  // layouts don't re-run on client-side navigation.
  const user = await requireActiveMember()
  const [announcements, orgKpis, openResponsibilities, latestReview] = await Promise.all([
    getAnnouncements(),
    getOrgKpis(),
    getOwnOpenResponsibilities(user.uid),
    getLatestReview(user.uid),
  ])

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.displayName ?? user.email}</h1>
          <p className="text-sm opacity-70 capitalize">
            {user.role.replace("_", " ")} · {user.membershipTier} tier
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/membership" className="text-sm underline opacity-70">
            Membership
          </Link>
          <LogoutButton />
        </div>
      </div>

      {orgKpis.length > 0 && (
        <section className="mb-8 grid grid-cols-2 gap-3">
          {orgKpis.map((kpi) => (
            <div key={kpi.id} className="border rounded-lg p-4">
              <p className="text-xs opacity-60">{kpi.label}</p>
              <p className="text-xl font-semibold">{kpi.value}</p>
            </div>
          ))}
        </section>
      )}

      {(openResponsibilities.length > 0 || latestReview) && (
        <section className="mb-8">
          {openResponsibilities.length > 0 && (
            <div className="mb-4">
              <h2 className="font-semibold mb-3">Your Responsibilities</h2>
              <ul className="flex flex-col gap-2">
                {openResponsibilities.map((r) => (
                  <li key={r.id} className="border rounded-lg p-3">
                    <p className="font-medium">{r.title}</p>
                    {r.dueDate && <p className="text-xs opacity-60">Due {r.dueDate}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {latestReview && (
            <div>
              <h2 className="font-semibold mb-3">Latest Review</h2>
              <div className="border rounded-lg p-3">
                <p className="font-medium">Rating: {latestReview.rating}/5</p>
                {latestReview.note && <p className="text-sm opacity-80">{latestReview.note}</p>}
              </div>
            </div>
          )}
        </section>
      )}

      <section>
        <h2 className="font-semibold mb-3">Announcements</h2>
        {announcements.length === 0 ? (
          <p className="text-sm opacity-60">Nothing posted yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {announcements.map((a) => (
              <li key={a.id} className="border rounded-lg p-4">
                <p className="font-medium">{a.title}</p>
                <p className="text-sm opacity-80">{a.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
