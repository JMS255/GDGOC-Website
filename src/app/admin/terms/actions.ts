"use server"

import { revalidatePath } from "next/cache"
import { Timestamp } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/dal"
import { TERM_MANAGERS } from "@/lib/types"

export async function createTerm(formData: FormData): Promise<void> {
  await requireRole(TERM_MANAGERS)

  const label = String(formData.get("label") ?? "").trim()
  const startDate = String(formData.get("startDate") ?? "")
  const endDate = String(formData.get("endDate") ?? "")
  if (!label || !startDate || !endDate) return

  await adminDb.collection("membershipTerms").add({
    label,
    startDate: Timestamp.fromDate(new Date(startDate)),
    endDate: Timestamp.fromDate(new Date(endDate)),
    isActive: false,
  })

  revalidatePath("/admin/terms")
}

/** Only one term should be active at a time — deactivates all others. */
export async function activateTerm(termId: string): Promise<void> {
  await requireRole(TERM_MANAGERS)

  const allTerms = await adminDb.collection("membershipTerms").get()
  const batch = adminDb.batch()
  allTerms.docs.forEach((doc) => {
    batch.update(doc.ref, { isActive: doc.id === termId })
  })
  await batch.commit()

  revalidatePath("/admin/terms")
  revalidatePath("/membership")
}
