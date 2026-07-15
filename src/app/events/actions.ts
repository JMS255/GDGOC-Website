"use server"

import { revalidatePath } from "next/cache"
import { Timestamp } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import { requireActiveMember } from "@/lib/dal"

export async function rsvpToEvent(eventId: string): Promise<void> {
  const user = await requireActiveMember()

  const existing = await adminDb
    .collection("rsvps")
    .where("eventId", "==", eventId)
    .where("uid", "==", user.uid)
    .limit(1)
    .get()

  if (!existing.empty) return // already RSVP'd, nothing to do

  await adminDb.collection("rsvps").add({
    eventId,
    uid: user.uid,
    rsvpAt: Timestamp.now(),
    attended: false,
    checkedInAt: null,
    checkedInBy: null,
    checkInMethod: null,
  })

  revalidatePath("/events")
}
