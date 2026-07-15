"use server"

import { revalidatePath } from "next/cache"
import { adminDb } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/dal"
import { DEPT_HEAD_OR_ABOVE } from "@/lib/types"

async function findLinkedRenewal(proofId: string) {
  const snapshot = await adminDb
    .collection("membershipRenewals")
    .where("paymentProofId", "==", proofId)
    .limit(1)
    .get()
  return snapshot.empty ? null : snapshot.docs[0]
}

export async function approvePayment(proofId: string, uid: string): Promise<void> {
  const admin = await requireRole(DEPT_HEAD_OR_ABOVE)
  const linkedRenewal = await findLinkedRenewal(proofId)

  const batch = adminDb.batch()
  batch.update(adminDb.collection("paymentProofs").doc(proofId), { status: "approved" })
  batch.update(adminDb.collection("users").doc(uid), { membershipTier: "paid" })
  if (linkedRenewal) {
    batch.update(linkedRenewal.ref, {
      status: "approved",
      reviewedBy: admin.uid,
      reviewedAt: new Date(),
    })
  }
  await batch.commit()

  revalidatePath("/admin/payments")
  revalidatePath("/membership")
}

export async function rejectPayment(proofId: string): Promise<void> {
  const admin = await requireRole(DEPT_HEAD_OR_ABOVE)
  const linkedRenewal = await findLinkedRenewal(proofId)

  const batch = adminDb.batch()
  batch.update(adminDb.collection("paymentProofs").doc(proofId), { status: "rejected" })
  if (linkedRenewal) {
    batch.update(linkedRenewal.ref, {
      status: "rejected",
      reviewedBy: admin.uid,
      reviewedAt: new Date(),
    })
  }
  await batch.commit()

  revalidatePath("/admin/payments")
  revalidatePath("/membership")
}
