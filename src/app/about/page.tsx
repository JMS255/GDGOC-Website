import Link from "next/link"

const FAQS = [
  {
    q: "Do I need to know how to code?",
    a: "No. GDGoC has six departments — Tech & Docu is the coding one, but Creative, Events, Logistics, Finance, and PR/Marketing don't require any programming background at all.",
  },
  {
    q: "Is membership free?",
    a: "There's a free tier and a paid tier. Paid tier gets you extra perks; free tier still gets you full access to events, projects, and the community. Neither is required to apply.",
  },
  {
    q: "What happens after I apply?",
    a: "Your application gets routed to the department head(s) matching what you're interested in. They'll reach out to schedule a short interview, then let you know if you're approved.",
  },
  {
    q: "How much time does this take?",
    a: "As much or as little as you want to put in — there's no minimum hour requirement. Show up to what interests you.",
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-4">About GDGoC</h1>
      <p className="opacity-80 mb-4">
        Google Developer Groups on Campus (GDGoC) is part of Google&apos;s global network of
        student communities — university chapters where students learn from each other, build
        real projects, and get hands-on with Google technologies alongside people who actually
        want to be there.
      </p>
      <p className="opacity-80">
        GDGoC AdZU is the Ateneo de Zamboanga University chapter. We&apos;re student-run, which
        means the events, projects, and direction of the org are shaped by whoever shows up and
        wants to help build it.
      </p>

      <div className="border-t-4 rounded-lg border p-5 mt-10 mb-10" style={{ borderTopColor: "var(--gdg-blue)" }}>
        <h2 className="font-semibold mb-2">What you actually get</h2>
        <ul className="list-disc list-inside text-sm opacity-80 flex flex-col gap-1">
          <li>Access to events, workshops, and tech talks year-round</li>
          <li>A department to actually contribute to — not just attend things</li>
          <li>Real projects to put on a resume or portfolio</li>
          <li>A community of students across courses and year levels who build things together</li>
        </ul>
      </div>

      <h2 className="text-xl font-bold mb-4">FAQ</h2>
      <div className="flex flex-col gap-4 mb-10">
        {FAQS.map((faq) => (
          <div key={faq.q} className="border rounded-lg p-4">
            <p className="font-medium mb-1">{faq.q}</p>
            <p className="text-sm opacity-70">{faq.a}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link href="/apply" className="rounded-full bg-gdg-blue text-white px-8 py-3.5 font-medium">
          Apply Now
        </Link>
      </div>
    </div>
  )
}
