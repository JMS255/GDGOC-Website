import Link from "next/link"
import { requireRole } from "@/lib/dal"
import { isDeptHeadOrAbove, COMMITTEE_OR_ABOVE, TERM_MANAGERS } from "@/lib/types"

interface AdminLink {
  href: string
  title: string
  description: string
  color: string
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
      },
      {
        href: "/admin/merch",
        title: "Merch",
        description: "Manage products and review guest checkout orders.",
        color: "var(--gdg-blue-halftone)",
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

export default async function AdminDashboardPage() {
  const admin = await requireRole(COMMITTEE_OR_ABOVE)
  const showDeptHeadSections = isDeptHeadOrAbove(admin.role)
  const showTermManagerLink = TERM_MANAGERS.includes(admin.role)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Admin Dashboard</h1>
      <p className="text-sm opacity-70 mb-10">
        Signed in as {admin.role.replace("_", " ")}
        {admin.department && ` · ${admin.department}`}
      </p>

      {showDeptHeadSections ? (
        <div className="flex flex-col gap-10">
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
                    <p className="font-medium mb-1">{link.title}</p>
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
