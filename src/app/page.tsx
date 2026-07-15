import Link from "next/link"
import { GdgDots } from "@/components/gdg-dots"

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-32 text-center flex flex-col items-center gap-8">
      <GdgDots />
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
        Connect with student developers at Adzu
      </h1>
      <p className="max-w-xl text-lg opacity-70">
        GDGoC brings together students who want to build, learn, and grow with Google
        technologies — through events, workshops, and hands-on projects.
      </p>
      <Link
        href="/login"
        className="rounded-full bg-foreground text-background px-8 py-3.5 font-medium"
      >
        Sign up
      </Link>
      <Link href="/events" className="text-sm underline opacity-70">
        See upcoming events
      </Link>
    </div>
  )
}
