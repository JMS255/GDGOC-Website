"use client"

import { useActionState } from "react"
import Link from "next/link"
import { submitProfile } from "./actions"

export function SignupForm() {
  const [state, action, pending] = useActionState(submitProfile, undefined)

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

      <div>
        <label htmlFor="interests" className="text-sm font-medium">
          Interests (comma-separated, e.g. web-dev, ml, design)
        </label>
        <input id="interests" name="interests" className="w-full border rounded px-3 py-2" />
        {state?.errors?.interests && <p className="text-sm text-red-600">{state.errors.interests}</p>}
      </div>

      <div>
        <label htmlFor="hearAboutUs" className="text-sm font-medium">
          How did you hear about GDGoC?
        </label>
        <input id="hearAboutUs" name="hearAboutUs" className="w-full border rounded px-3 py-2" />
        {state?.errors?.hearAboutUs && (
          <p className="text-sm text-red-600">{state.errors.hearAboutUs}</p>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="consentGiven" className="mt-1" />
        <span>
          I consent to GDGoC collecting and storing this information for membership
          processing, in line with the{" "}
          <Link href="/privacy-policy" className="underline">
            Privacy Policy
          </Link>
          .
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
