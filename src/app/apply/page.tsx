import { ApplicationForm } from "./application-form"

export default function ApplyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">Apply to GDGoC</h1>
      <p className="text-sm opacity-70 mb-6">
        No account needed yet — just tell us about yourself and we&apos;ll reach out to schedule an
        interview.
      </p>
      <ApplicationForm />
    </div>
  )
}
