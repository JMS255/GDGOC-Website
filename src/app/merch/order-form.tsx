"use client"

import { useState, type FormEvent } from "react"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase/client"
import { submitMerchOrder } from "./actions"

interface OrderFormProps {
  productId: string
  variants: string[]
}

export function OrderForm({ productId, variants }: OrderFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDone, setIsDone] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const buyerName = (form.elements.namedItem("buyerName") as HTMLInputElement).value
    const buyerContact = (form.elements.namedItem("buyerContact") as HTMLInputElement).value
    const quantity = Number((form.elements.namedItem("quantity") as HTMLInputElement).value)
    const variant = variants.length
      ? (form.elements.namedItem("variant") as HTMLSelectElement).value
      : null
    const fileInput = form.elements.namedItem("proofImage") as HTMLInputElement
    const file = fileInput.files?.[0]

    if (!file) {
      setError("Attach a GCash payment screenshot.")
      return
    }

    setIsSubmitting(true)
    try {
      const storageRef = ref(storage, `merchOrders/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const proofImageURL = await getDownloadURL(storageRef)

      const result = await submitMerchOrder({
        buyerName,
        buyerContact,
        productId,
        variant,
        quantity,
        proofImageURL,
      })

      if (result.error) {
        setError(result.error)
        return
      }
      setIsDone(true)
    } catch {
      setError("Something went wrong submitting your order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isDone) {
    return <p className="text-sm font-medium">Order submitted — we&apos;ll confirm once payment is reviewed.</p>
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-sm rounded-full bg-gdg-blue text-white px-5 py-2 font-medium"
      >
        Order
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-3">
      <input name="buyerName" placeholder="Your name" required className="border rounded px-3 py-2 text-sm" />
      <input
        name="buyerContact"
        placeholder="Phone or email"
        required
        className="border rounded px-3 py-2 text-sm"
      />
      {variants.length > 0 && (
        <select name="variant" required className="border rounded px-3 py-2 text-sm">
          {variants.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      )}
      <input
        type="number"
        name="quantity"
        min={1}
        defaultValue={1}
        required
        className="border rounded px-3 py-2 text-sm"
      />
      <label className="text-xs opacity-60">GCash payment screenshot</label>
      <input type="file" name="proofImage" accept="image/*" required className="text-sm" />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="text-sm rounded-full bg-gdg-blue text-white px-5 py-2 font-medium self-start disabled:opacity-50"
      >
        {isSubmitting ? "Submitting…" : "Submit order"}
      </button>
    </form>
  )
}
