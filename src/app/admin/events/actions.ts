"use server"

import { revalidatePath } from "next/cache"
import { Timestamp } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/dal"
import { DEPT_HEAD_OR_ABOVE } from "@/lib/types"
import { EventFormSchema, type EventFormState } from "./definitions"

export async function createEvent(
  _state: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  const user = await requireRole(DEPT_HEAD_OR_ABOVE)

  const validated = EventFormSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    department: formData.get("department"),
    location: formData.get("location"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { title, description, department, location, startsAt, endsAt } = validated.data

  await adminDb.collection("events").add({
    title,
    description,
    department,
    location,
    startsAt: Timestamp.fromDate(new Date(startsAt)),
    endsAt: Timestamp.fromDate(new Date(endsAt)),
    status: "draft",
    createdBy: user.uid,
    createdAt: Timestamp.now(),
  })

  revalidatePath("/admin/events")
}

export async function publishEvent(eventId: string): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  await adminDb.collection("events").doc(eventId).update({ status: "published" })
  revalidatePath("/admin/events")
  revalidatePath("/events")
}

export async function cancelEvent(eventId: string): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  await adminDb.collection("events").doc(eventId).update({ status: "cancelled" })
  revalidatePath("/admin/events")
  revalidatePath("/events")
}
