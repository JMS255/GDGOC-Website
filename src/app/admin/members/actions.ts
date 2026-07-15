"use server"

import { revalidatePath } from "next/cache"
import { adminDb } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/dal"
import { DEPT_HEAD_OR_ABOVE, type MembershipTier } from "@/lib/types"

export async function approveMember(uid: string, tier: MembershipTier): Promise<void> {
  // Re-checked here, not just trusted from the UI — Server Actions are
  // public-facing endpoints and must authorize themselves.
  await requireRole(DEPT_HEAD_OR_ABOVE)

  await adminDb.collection("users").doc(uid).update({
    membershipStatus: "active",
    membershipTier: tier,
    updatedAt: new Date(),
  })

  revalidatePath("/admin/members")
}

export async function rejectMember(uid: string): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)

  await adminDb.collection("users").doc(uid).update({
    membershipStatus: "rejected",
    updatedAt: new Date(),
  })

  revalidatePath("/admin/members")
}
