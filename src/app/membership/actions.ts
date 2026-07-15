"use server"

import { revalidatePath } from "next/cache"
import { Timestamp } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import { requireActiveMember } from "@/lib/dal"

/**
 * Records a payment-proof submission after the client has already uploaded
 * the image to Storage (see payment-proof-form.tsx) — this just writes the
 * Firestore record an admin will review in /admin/payments.
 */
export async function submitPaymentProof(imageURL: string, amount: number | null): Promise<void> {
  const user = await requireActiveMember()

  const existingPending = await adminDb
    .collection("paymentProofs")
    .where("uid", "==", user.uid)
    .where("status", "==", "pending")
    .limit(1)
    .get()

  if (!existingPending.empty) {
    throw new Error("You already have a payment proof under review.")
  }

  await adminDb.collection("paymentProofs").add({
    uid: user.uid,
    memberName: user.displayName ?? user.email,
    imageURL,
    amount,
    status: "pending",
    submittedAt: Timestamp.now(),
  })

  revalidatePath("/membership")
}
