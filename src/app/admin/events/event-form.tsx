"use client"

import { useActionState } from "react"
import { createEvent } from "./actions"

export function EventForm() {
  const [state, action, pending] = useActionState(createEvent, undefined)

  return (
    <form action={action} className="flex flex-col gap-3 max-w-md mb-10">
      <div>
        <input
          name="title"
          placeholder="Title"
          className="w-full border rounded px-3 py-2"
        />
        {state?.errors?.title && <p className="text-sm text-red-600">{state.errors.title}</p>}
      </div>
      <div>
        <textarea
          name="description"
          placeholder="Description"
          className="w-full border rounded px-3 py-2"
        />
        {state?.errors?.description && (
          <p className="text-sm text-red-600">{state.errors.description}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <input
            name="department"
            placeholder="Organizing department"
            className="w-full border rounded px-3 py-2"
          />
          {state?.errors?.department && (
            <p className="text-sm text-red-600">{state.errors.department}</p>
          )}
        </div>
        <div>
          <input
            name="location"
            placeholder="Location"
            className="w-full border rounded px-3 py-2"
          />
          {state?.errors?.location && (
            <p className="text-sm text-red-600">{state.errors.location}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs opacity-60">Starts</label>
          <input
            type="datetime-local"
            name="startsAt"
            className="w-full border rounded px-3 py-2"
          />
          {state?.errors?.startsAt && (
            <p className="text-sm text-red-600">{state.errors.startsAt}</p>
          )}
        </div>
        <div>
          <label className="text-xs opacity-60">Ends</label>
          <input
            type="datetime-local"
            name="endsAt"
            className="w-full border rounded px-3 py-2"
          />
          {state?.errors?.endsAt && <p className="text-sm text-red-600">{state.errors.endsAt}</p>}
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-foreground text-background px-6 py-2.5 font-medium self-start disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create draft event"}
      </button>
    </form>
  )
}
