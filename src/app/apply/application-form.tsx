"use client"

import { useActionState, useState } from "react"
import { DEPARTMENTS } from "@/lib/types"
import { DEPARTMENT_INFO } from "./department-info"
import { submitApplication } from "./actions"

export function ApplicationForm() {
  const [state, action, pending] = useActionState(submitApplication, undefined)
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const isSubmitted = state !== undefined && !state.errors

  function toggleDepartment(dept: string) {
    setSelectedDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    )
  }

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
        <legend className="text-sm font-medium mb-1">What are you interested in?</legend>
        <p className="text-xs opacity-60 mb-3">
          Pick a department to see what it actually does and what skills we&apos;re looking for.
        </p>
        <div className="flex flex-col gap-3">
          {DEPARTMENTS.map((dept) => {
            const info = DEPARTMENT_INFO[dept]
            const isSelected = selectedDepartments.includes(dept)
            return (
              <div key={dept} className={`border rounded-lg p-3 ${isSelected ? "border-gdg-blue" : ""}`}>
                <label className="flex items-start gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    name="interests"
                    value={dept}
                    checked={isSelected}
                    onChange={() => toggleDepartment(dept)}
                    className="mt-1"
                  />
                  <span>{info.label}</span>
                </label>
                <p className="text-xs opacity-60 mt-1 ml-6">{info.description}</p>

                {isSelected && (
                  <div className="mt-3 ml-6 flex flex-col gap-1.5">
                    <p className="text-xs font-medium opacity-70">
                      Any of these skills? (optional, helps us know where to place you)
                    </p>
                    {info.skills.map((skill) => (
                      <label key={skill} className="flex items-center gap-2 text-sm">
                        <input type="checkbox" name="skills" value={skill} />
                        {skill}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
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
