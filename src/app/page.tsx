import Link from "next/link"
import { GdgDots } from "@/components/gdg-dots"
import { DEPARTMENTS } from "@/lib/types"
import { DEPARTMENT_INFO, DEPARTMENT_COLOR } from "@/lib/department-info"

const FEATURES = [
  {
    title: "Events",
    color: "var(--gdg-blue)",
    description: "Workshops, tech talks, and hangouts — hosted by students, for students.",
  },
  {
    title: "Projects",
    color: "var(--gdg-green)",
    description: "Ship real apps and tools with people who actually want to build things.",
  },
  {
    title: "Community",
    color: "var(--gdg-yellow)",
    description: "A campus full of developers, designers, and organizers to learn alongside.",
  },
]

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: "var(--gdg-blue)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 -right-20 w-80 h-80 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: "var(--gdg-yellow)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 w-64 h-64 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: "var(--gdg-green)" }}
      />

      <div className="relative max-w-3xl mx-auto px-6 py-28 text-center flex flex-col items-center gap-6">
        <GdgDots />
        <span
          className="font-mono text-sm px-3 py-1 rounded-full border"
          style={{ borderColor: "var(--gdg-blue)", color: "var(--gdg-blue)" }}
        >
          &lt;GDGoC AdZU /&gt;
        </span>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
          Connect with student <span style={{ color: "var(--gdg-blue)" }}>developers</span> at{" "}
          <span style={{ color: "var(--gdg-red)" }}>Adzu</span>
        </h1>
        <p className="max-w-xl text-lg opacity-70">
          GDGoC brings together students who want to build, learn, and grow with Google
          technologies — through events, workshops, and hands-on projects.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
          <Link
            href="/apply"
            className="rounded-full bg-gdg-blue text-white px-8 py-3.5 font-medium"
          >
            Apply Now
          </Link>
          <Link
            href="/events"
            className="rounded-full border-2 px-8 py-3.5 font-medium"
            style={{ borderColor: "var(--gdg-blue)" }}
          >
            See upcoming events
          </Link>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6 pb-16 grid sm:grid-cols-3 gap-6">
        {FEATURES.map((f) => (
          <div key={f.title} className="border-t-4 rounded-lg p-5 border" style={{ borderTopColor: f.color }}>
            <h2 className="font-semibold mb-1">{f.title}</h2>
            <p className="text-sm opacity-70">{f.description}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-2">Find where you fit</h2>
        <p className="text-center opacity-70 mb-8 max-w-lg mx-auto">
          Six departments, six different ways to get involved — pick whichever matches what
          you&apos;re actually good at.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEPARTMENTS.map((dept) => {
            const info = DEPARTMENT_INFO[dept]
            const color = DEPARTMENT_COLOR[dept]
            return (
              <div key={dept} className="border rounded-lg p-4">
                <span
                  className="inline-block text-xs font-bold uppercase tracking-wide rounded-full px-2 py-0.5 mb-2 text-black"
                  style={{ backgroundColor: color }}
                >
                  {dept}
                </span>
                <p className="font-medium mb-1">{info.label}</p>
                <p className="text-sm opacity-70">{info.description}</p>
              </div>
            )
          })}
        </div>
        <div className="text-center mt-8">
          <Link href="/apply" className="rounded-full bg-gdg-blue text-white px-8 py-3.5 font-medium">
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  )
}
