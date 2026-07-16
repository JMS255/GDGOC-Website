"use server"

import { revalidatePath } from "next/cache"
import { adminDb } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/dal"
import { TERM_MANAGERS } from "@/lib/types"

export async function createKpi(formData: FormData): Promise<void> {
  await requireRole(TERM_MANAGERS)

  const label = String(formData.get("label") ?? "").trim()
  const value = String(formData.get("value") ?? "").trim()
  if (!label || !value) return

  await adminDb.collection("orgKpis").add({ label, value })

  revalidatePath("/admin/kpis")
  revalidatePath("/dashboard")
}

export async function updateKpi(id: string, label: string, value: string): Promise<void> {
  await requireRole(TERM_MANAGERS)
  if (!label.trim() || !value.trim()) return

  await adminDb.collection("orgKpis").doc(id).update({ label: label.trim(), value: value.trim() })

  revalidatePath("/admin/kpis")
  revalidatePath("/dashboard")
}

export async function deleteKpi(id: string): Promise<void> {
  await requireRole(TERM_MANAGERS)
  await adminDb.collection("orgKpis").doc(id).delete()
  revalidatePath("/admin/kpis")
  revalidatePath("/dashboard")
}
