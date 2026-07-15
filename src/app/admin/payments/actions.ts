"use server"

import { revalidatePath } from "next/cache"
import { adminDb } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/dal"
import { DEPT_HEAD_OR_ABOVE } from "@/lib/types"

export async function approvePayment(proofId: string, uid: string): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)

  const batch = adminDb.batch()
  batch.update(adminDb.collection("paymentProofs").doc(proofId), { status: "approved" })
  batch.update(adminDb.collection("users").doc(uid), { membershipTier: "paid" })
  await batch.commit()

  revalidatePath("/admin/payments")
  revalidatePath("/membership")
}

export async function rejectPayment(proofId: string): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  await adminDb.collection("paymentProofs").doc(proofId).update({ status: "rejected" })
  revalidatePath("/admin/payments")
  revalidatePath("/membership")
}
