"use client"

import { useActionState } from "react"
import { DEPARTMENTS } from "@/lib/types"
import { submitApplication } from "./actions"

const INTEREST_LABELS: Record<(typeof DEPARTMENTS)[number], string> = {
  Events: "Organizing Events & Hosting",
  Creatives: "UI/UX & Graphic Design",
  "Tech & Docu": "Coding & App Dev",
  "PR & Marketing": "Writing & Social Media",
  Finance: "Budgets & Money Management",
}

export function ApplicationForm() {
  const [state, action, pending] = useActionState(submitApplication, undefined)
  const isSubmitted = state !== undefined && !state.errors

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-2">Application received</h2>
        <p className="opacity-70">
          Our team will review your profile and reach out to schedule a quick interview.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4 max-w-md">
      <div>
        <label htmlFor="fullName" className="text-sm font-medium">
          Full name
        </label>
        <input id="fullName" name="fullName" className="w-full border rounded px-3 py-2" />
        {state?.errors?.fullName && <p className="text-sm text-red-600">{state.errors.fullName}</p>}
      </div>

      <div>
        <label htmlFor="email" className="text-sm font-medium">
          Adzu email
        </label>
        <input id="email" name="email" type="email" className="w-full border rounded px-3 py-2" />
        {state?.errors?.email && <p className="text-sm text-red-600">{state.errors.email}</p>}
      </div>

      <div>
        <label htmlFor="studentId" className="text-sm font-medium">
          Student ID
        </label>
        <input id="studentId" name="studentId" className="w-full border rounded px-3 py-2" />
        {state?.errors?.studentId && <p className="text-sm text-red-600">{state.errors.studentId}</p>}
      </div>

      <div>
        <label htmlFor="course" className="text-sm font-medium">
          Course
        </label>
        <input id="course" name="course" className="w-full border rounded px-3 py-2" />
        {state?.errors?.course && <p className="text-sm text-red-600">{state.errors.course}</p>}
      </div>

      <div>
        <label htmlFor="yearLevel" className="text-sm font-medium">
          Year level
        </label>
        <input
          id="yearLevel"
          name="yearLevel"
          type="number"
          min={1}
          max={5}
          className="w-full border rounded px-3 py-2"
        />
        {state?.errors?.yearLevel && <p className="text-sm text-red-600">{state.errors.yearLevel}</p>}
      </div>

      <div>
        <label htmlFor="contactNumber" className="text-sm font-medium">
          Contact number
        </label>
        <input id="contactNumber" name="contactNumber" className="w-full border rounded px-3 py-2" />
        {state?.errors?.contactNumber && (
          <p className="text-sm text-red-600">{state.errors.contactNumber}</p>
        )}
      </div>

      <fieldset>
        <legend className="text-sm font-medium mb-2">What are you interested in?</legend>
        <div className="flex flex-col gap-2">
          {DEPARTMENTS.map((dept) => (
            <label key={dept} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="interests" value={dept} />
              {INTEREST_LABELS[dept]}
            </label>
          ))}
        </div>
        {state?.errors?.interests && <p className="text-sm text-red-600">{state.errors.interests}</p>}
      </fieldset>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consentGiven" className="mt-1" />
        <span>
          I consent to GDGoC collecting and storing this information for membership processing.
        </span>
      </label>
      {state?.errors?.consentGiven && (
        <p className="text-sm text-red-600">{state.errors.consentGiven}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground text-background px-6 py-3 font-medium disabled:opacity-50"
      >
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  )
}
