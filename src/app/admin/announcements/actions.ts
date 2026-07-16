"use server"

import { revalidatePath } from "next/cache"
import { Timestamp } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/dal"
import { DEPT_HEAD_OR_ABOVE } from "@/lib/types"

export async function createAnnouncement(formData: FormData): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)

  const title = String(formData.get("title") ?? "").trim()
  const body = String(formData.get("body") ?? "").trim()
  if (!title || !body) return

  await adminDb.collection("announcements").add({
    title,
    body,
    createdAt: Timestamp.now(),
  })

  revalidatePath("/admin/announcements")
  revalidatePath("/dashboard")
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  await adminDb.collection("announcements").doc(id).delete()
  revalidatePath("/admin/announcements")
  revalidatePath("/dashboard")
}
