"use server"

import { Timestamp } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import { MerchOrderSchema } from "./definitions"

/**
 * Public, unauthenticated action — guest checkout, no account required (an
 * explicit product decision, since not everyone buying merch is a GDGoC
 * member). This is the ONLY way an order gets written; Firestore rules
 * block direct client writes to merchOrders entirely, so this server-side
 * validation is the actual security boundary, not a convenience layer.
 */
export async function submitMerchOrder(input: {
  buyerName: string
  buyerContact: string
  productId: string
  variant: string | null
  quantity: number
  proofImageURL: string
}): Promise<{ error?: string }> {
  const validated = MerchOrderSchema.safeParse({
    buyerName: input.buyerName,
    buyerContact: input.buyerContact,
    variant: input.variant,
    quantity: input.quantity,
  })

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message ?? "Invalid order." }
  }

  const productSnap = await adminDb.collection("products").doc(input.productId).get()
  if (!productSnap.exists || !productSnap.data()?.isActive) {
    return { error: "This product is no longer available." }
  }
  const product = productSnap.data()!

  const { buyerName, buyerContact, variant, quantity } = validated.data

  await adminDb.collection("merchOrders").add({
    buyerName,
    buyerContact,
    productId: input.productId,
    productName: product.name,
    variant,
    quantity,
    totalAmount: product.price * quantity,
    proofImageURL: input.proofImageURL,
    status: "pending",
    createdAt: Timestamp.now(),
  })

  return {}
}
