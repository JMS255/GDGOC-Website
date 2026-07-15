"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { auth, storage } from "@/lib/firebase/client"
import { submitPaymentProof } from "./actions"

export function PaymentProofForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = e.currentTarget
    const fileInput = form.elements.namedItem("proofImage") as HTMLInputElement
    const amountInput = form.elements.namedItem("amount") as HTMLInputElement
    const file = fileInput.files?.[0]
    const uid = auth.currentUser?.uid

    if (!file || !uid) {
      setError("Select a screenshot first.")
      return
    }

    setIsSubmitting(true)
    try {
      const storageRef = ref(storage, `paymentProofs/${uid}/${Date.now()}-${file.name}`)
      await uploadBytes(storageRef, file)
      const imageURL = await getDownloadURL(storageRef)

      const amount = amountInput.value ? Number(amountInput.value) : null
      await submitPaymentProof(imageURL, amount)

      router.refresh()
    } catch {
      setError("Upload failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-sm">
      <div>
        <label className="text-sm font-medium">GCash payment screenshot</label>
        <input
          type="file"
          name="proofImage"
          accept="image/*"
          required
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Amount paid (optional)</label>
        <input
          type="number"
          name="amount"
          step="0.01"
          className="w-full border rounded px-3 py-2"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-foreground text-background px-6 py-2.5 font-medium self-start disabled:opacity-50"
      >
        {isSubmitting ? "Uploading…" : "Submit for review"}
      </button>
    </form>
  )
}
