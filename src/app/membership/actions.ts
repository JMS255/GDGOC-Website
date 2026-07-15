"use server"

import { revalidatePath } from "next/cache"
import { Timestamp } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import { requireActiveMember } from "@/lib/dal"

/**
 * Records a payment-proof submission after the client has already uploaded
 * the image to Storage (see payment-proof-form.tsx) — this just writes the
 * Firestore record an admin will review in /admin/payments.
 *
 * When termId is provided, this proof is for a paid-tier renewal of that
 * term rather than a first-time tier upgrade — approvePayment() links it to
 * a membershipRenewals record accordingly (see admin/payments/actions.ts).
 */
export async function submitPaymentProof(
  imageURL: string,
  amount: number | null,
  termId: string | null = null
): Promise<void> {
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

  const proofRef = adminDb.collection("paymentProofs").doc()
  await proofRef.set({
    uid: user.uid,
    memberName: user.displayName ?? user.email,
    imageURL,
    amount,
    termId,
    status: "pending",
    submittedAt: Timestamp.now(),
  })

  // Renewal proofs also get a pending membershipRenewals record right away,
  // so renewal history/status only ever needs to be read from one place —
  // approvePayment/rejectPayment (admin/payments/actions.ts) resolve it
  // alongside the proof itself.
  if (termId) {
    await adminDb.collection("membershipRenewals").add({
      uid: user.uid,
      termId,
      tier: "paid",
      status: "pending",
      paymentProofId: proofRef.id,
      reviewedBy: null,
      reviewedAt: null,
      createdAt: Timestamp.now(),
    })
  }

  revalidatePath("/membership")
}

/** Free tier renewal needs no review — approved the moment it's submitted. */
export async function renewFree(termId: string): Promise<void> {
  const user = await requireActiveMember()

  const existing = await adminDb
    .collection("membershipRenewals")
    .where("uid", "==", user.uid)
    .where("termId", "==", termId)
    .limit(1)
    .get()

  if (!existing.empty) return // already renewed for this term

  await adminDb.collection("membershipRenewals").add({
    uid: user.uid,
    termId,
    tier: "free",
    status: "approved",
    paymentProofId: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: Timestamp.now(),
  })

  revalidatePath("/membership")
}
