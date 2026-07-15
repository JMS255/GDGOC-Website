"use server"

import { revalidatePath } from "next/cache"
import { adminDb } from "@/lib/firebase/admin"
import { requireRole } from "@/lib/dal"
import { DEPT_HEAD_OR_ABOVE, type MerchOrderStatus } from "@/lib/types"

export async function createProduct(formData: FormData): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)

  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim()
  const price = Number(formData.get("price"))
  const imageURL = String(formData.get("imageURL") ?? "").trim() || null
  const variantsRaw = String(formData.get("variants") ?? "").trim()
  const variants = variantsRaw ? variantsRaw.split(",").map((v) => v.trim()).filter(Boolean) : []

  if (!name || !price) return

  await adminDb.collection("products").add({
    name,
    description,
    imageURL,
    price,
    variants,
    isActive: true,
  })

  revalidatePath("/admin/merch")
  revalidatePath("/merch")
}

export async function toggleProductActive(productId: string, isActive: boolean): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  await adminDb.collection("products").doc(productId).update({ isActive })
  revalidatePath("/admin/merch")
  revalidatePath("/merch")
}

export async function setOrderStatus(orderId: string, status: MerchOrderStatus): Promise<void> {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  await adminDb.collection("merchOrders").doc(orderId).update({ status })
  revalidatePath("/admin/merch")
}
