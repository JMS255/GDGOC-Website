import Link from "next/link"
import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { isDeptHeadOrAbove, COMMITTEE_OR_ABOVE, TERM_MANAGERS, type Role } from "@/lib/types"

interface AdminLink {
  href: string
  title: string
  description: string
  color: string
  badgeKey?: keyof Stats
}

const SECTIONS: { heading: string; links: AdminLink[] }[] = [
  {
    heading: "Membership",
    links: [
      {
        href: "/admin/applications",
        title: "Applications",
        description: "Review new applicants routed to your department, add interview notes, approve or reject.",
        color: "var(--gdg-blue)",
        badgeKey: "pendingApplications",
      },
      {
        href: "/admin/members",
        title: "Members",
        description: "Active members — assign responsibilities, submit performance reviews, manage roles.",
        color: "var(--gdg-green)",
      },
    ],
  },
  {
    heading: "Events & Commerce",
    links: [
      {
        href: "/admin/events",
        title: "Events",
        description: "Create, publish, and check in attendees for GDGoC events.",
        color: "var(--gdg-yellow)",
      },
      {
        href: "/admin/payments",
        title: "Payments",
        description: "Review GCash payment-proof screenshots for paid-tier upgrades and renewals.",
        color: "var(--gdg-red)",
        badgeKey: "pendingPayments",
      },
      {
        href: "/admin/merch",
        title: "Merch",
        description: "Manage products and review guest checkout orders.",
        color: "var(--gdg-blue-halftone)",
        badgeKey: "pendingOrders",
      },
    ],
  },
  {
    heading: "Organization",
    links: [
      {
        href: "/admin/terms",
        title: "Terms",
        description: "Create and activate the membership term members renew against.",
        color: "var(--gdg-red-halftone)",
      },
      {
        href: "/admin/announcements",
        title: "Announcements",
        description: "Post updates shown on every member's dashboard.",
        color: "var(--gdg-green-halftone)",
      },
      {
        href: "/admin/analytics",
        title: "Analytics",
        description: "Membership funnel, demographics, and event attendance.",
        color: "var(--gdg-yellow-halftone)",
      },
    ],
  },
]

const TERM_MANAGER_LINK: AdminLink = {
  href: "/admin/kpis",
  title: "Org KPIs",
  description: "Set the stat tiles shown at the top of every member's dashboard.",
  color: "var(--gdg-blue)",
}

interface Stats {
  pendingApplications: number
  pendingPayments: number
  pendingOrders: number
  activeMembers: number
  upcomingEvents: number
}

async function getStats(admin: { role: Role; department: string | null }): Promise<Stats> {
  const isDeptHeadOnly = admin.role === "department_head"

  let applicationsQuery = adminDb.collection("applications").where("status", "==", "new")
  if (isDeptHeadOnly) {
    applicationsQuery = applicationsQuery.where("interests", "array-contains", admin.department ?? "")
  }

  const [applicationsCount, paymentsCount, ordersCount, membersCount, eventsSnapshot] = await Promise.all([
    applicationsQuery.count().get(),
    adminDb.collection("paymentProofs").where("status", "==", "pending").count().get(),
    adminDb.collection("merchOrders").where("status", "==", "pending").count().get(),
    adminDb.collection("users").where("membershipStatus", "==", "active").count().get(),
    adminDb.collection("events").where("status", "==", "published").get(),
  ])

  const now = Date.now()
  const upcomingEvents = eventsSnapshot.docs.filter((doc) => doc.data().startsAt.toDate().getTime() >= now).length

  return {
    pendingApplications: applicationsCount.data().count,
    pendingPayments: paymentsCount.data().count,
    pendingOrders: ordersCount.data().count,
    activeMembers: membersCount.data().count,
    upcomingEvents,
  }
}

const STAT_TILES: { key: keyof Stats; label: string; color: string }[] = [
  { key: "pendingApplications", label: "Applications to review", color: "var(--gdg-blue)" },
  { key: "pendingPayments", label: "Payments to review", color: "var(--gdg-red)" },
  { key: "pendingOrders", label: "Merch orders to review", color: "var(--gdg-blue-halftone)" },
  { key: "activeMembers", label: "Active members", color: "var(--gdg-green)" },
  { key: "upcomingEvents", label: "Upcoming events", color: "var(--gdg-yellow)" },
]

function Badge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-1.5 rounded-full bg-gdg-red text-white text-xs font-semibold">
      {count}
    </span>
  )
}

export default async function AdminDashboardPage() {
  const admin = await requireRole(COMMITTEE_OR_ABOVE)
  const showDeptHeadSections = isDeptHeadOrAbove(admin.role)
  const showTermManagerLink = TERM_MANAGERS.includes(admin.role)
  const stats = showDeptHeadSections ? await getStats(admin) : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-sm opacity-70 mb-10">
        Signed in as {admin.role.replace("_", " ")}
        {admin.department && ` · ${admin.department}`}
      </p>

      {showDeptHeadSections ? (
        <div className="flex flex-col gap-10">
          {stats && (
            <section>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {STAT_TILES.map((tile) => (
                  <div
                    key={tile.key}
                    className="border-t-4 rounded-lg p-4 border"
                    style={{ borderTopColor: tile.color }}
                  >
                    <p className="text-xs opacity-60">{tile.label}</p>
                    <p className="text-xl font-semibold">{stats[tile.key]}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {SECTIONS.map((section) => (
            <section key={section.heading}>
              <h2 className="font-semibold mb-3">{section.heading}</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {section.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="border-t-4 rounded-lg border p-4 hover:bg-black/5"
                    style={{ borderTopColor: link.color }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-medium">{link.title}</p>
                      {stats && link.badgeKey && <Badge count={stats[link.badgeKey]} />}
                    </div>
                    <p className="text-sm opacity-70">{link.description}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}

          {showTermManagerLink && (
            <section>
              <h2 className="font-semibold mb-3">Chief Exec / System Admin</h2>
              <Link
                href={TERM_MANAGER_LINK.href}
                className="block border-t-4 rounded-lg border p-4 hover:bg-black/5 max-w-sm"
                style={{ borderTopColor: TERM_MANAGER_LINK.color }}
              >
                <p className="font-medium mb-1">{TERM_MANAGER_LINK.title}</p>
                <p className="text-sm opacity-70">{TERM_MANAGER_LINK.description}</p>
              </Link>
            </section>
          )}
        </div>
      ) : (
        <section>
          <h2 className="font-semibold mb-3">Membership Lookup</h2>
          <Link
            href="/lookup"
            className="block border-t-4 rounded-lg border p-4 hover:bg-black/5 max-w-sm"
            style={{ borderTopColor: "var(--gdg-blue)" }}
          >
            <p className="font-medium mb-1">Lookup</p>
            <p className="text-sm opacity-70">
              Search members by name or email to verify membership — e.g. at an event door.
            </p>
          </Link>
        </section>
      )}
    </div>
  )
}
