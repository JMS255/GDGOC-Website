"use server"

import { revalidatePath } from "next/cache"
import { adminDb } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/dal"
import { DEPT_HEAD_OR_ABOVE } from "@/lib/types"

export async function saveInterviewNotes(
  applicationId: string,
  notes: string,
  rating: number | null
): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  await adminDb.collection("applications").doc(applicationId).update({
    interviewNotes: notes,
    rating,
  })
  revalidatePath(`/admin/applications/${applicationId}`)
}

export async function approveApplication(applicationId: string): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  await adminDb.collection("applications").doc(applicationId).update({ status: "approved" })
  revalidatePath(`/admin/applications/${applicationId}`)
  revalidatePath("/admin/applications")
}

export async function rejectApplication(applicationId: string): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  await adminDb.collection("applications").doc(applicationId).update({ status: "rejected" })
  revalidatePath(`/admin/applications/${applicationId}`)
  revalidatePath("/admin/applications")
}
