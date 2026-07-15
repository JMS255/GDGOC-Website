"use server"

import { revalidatePath } from "next/cache"
import { adminDb } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/dal"
import { DEPT_HEAD_OR_ABOVE } from "@/lib/types"

export async function toggleCheckIn(rsvpId: string, eventId: string, checkedIn: boolean): Promise<void> {
  const admin = await requireRole(DEPT_HEAD_OR_ABOVE)

  await adminDb
    .collection("rsvps")
    .doc(rsvpId)
    .update(
      checkedIn
        ? { attended: true, checkedInAt: new Date(), checkedInBy: admin.uid, checkInMethod: "manual" }
        : { attended: false, checkedInAt: null, checkedInBy: null, checkInMethod: null }
    )

  revalidatePath(`/admin/events/${eventId}/checkin`)
}
