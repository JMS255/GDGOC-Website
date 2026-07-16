"use server"

import { revalidatePath } from "next/cache"
import { Timestamp } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/dal"
import { DEPT_HEAD_OR_ABOVE, CHIEF_EXEC_ONLY, ALL_ROLES, type ResponsibilityStatus, type Role } from "@/lib/types"

export async function assignResponsibility(
  memberUid: string,
  title: string,
  dueDate: string | null
): Promise<void> {
  const admin = await requireRole(DEPT_HEAD_OR_ABOVE)
  if (!title.trim()) return

  await adminDb.collection("responsibilities").add({
    assignedTo: memberUid,
    assignedBy: admin.uid,
    title: title.trim(),
    dueDate: dueDate ? Timestamp.fromDate(new Date(dueDate)) : null,
    status: "assigned",
    createdAt: Timestamp.now(),
  })

  revalidatePath(`/admin/members/${memberUid}`)
}

export async function setResponsibilityStatus(
  responsibilityId: string,
  memberUid: string,
  status: ResponsibilityStatus
): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  await adminDb.collection("responsibilities").doc(responsibilityId).update({ status })
  revalidatePath(`/admin/members/${memberUid}`)
}

export async function assignRole(
  memberUid: string,
  role: string,
  department: string | null
): Promise<void> {
  // Chief Exec only — the one thing System Admin deliberately can't do.
  await requireRole(CHIEF_EXEC_ONLY)

  if (!ALL_ROLES.includes(role as Role)) return

  await adminDb.collection("users").doc(memberUid).update({
    role,
    department: role === "member" ? null : department,
    updatedAt: new Date(),
  })

  revalidatePath(`/admin/members/${memberUid}`)
  revalidatePath("/admin/members")
}

export async function submitPerformanceReview(
  memberUid: string,
  termId: string,
  rating: number,
  note: string
): Promise<void> {
  const admin = await requireRole(DEPT_HEAD_OR_ABOVE)

  await adminDb.collection("performanceReviews").add({
    uid: memberUid,
    termId,
    reviewedBy: admin.uid,
    rating,
    note: note.trim(),
    createdAt: Timestamp.now(),
  })

  revalidatePath(`/admin/members/${memberUid}`)
}
