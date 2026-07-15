import Image from "next/image"
import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { DEPT_HEAD_OR_ABOVE, type PaymentProofRecord } from "@/lib/types"
import { approvePayment, rejectPayment } from "./actions"

async function getPendingProofs(): Promise<PaymentProofRecord[]> {
  const snapshot = await adminDb
    .collection("paymentProofs")
    .where("status", "==", "pending")
    .orderBy("submittedAt", "asc")
    .get()

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      uid: data.uid,
      memberName: data.memberName,
      imageURL: data.imageURL,
      amount: data.amount,
      status: data.status,
      submittedAt: data.submittedAt.toDate(),
    }
  })
}

export default async function AdminPaymentsPage() {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  const proofs = await getPendingProofs()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Payment Proofs</h1>
      {proofs.length === 0 ? (
        <p className="opacity-60">Nothing pending review.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-4">
          {proofs.map((proof) => (
            <li key={proof.id} className="border rounded-lg p-4 flex gap-4">
              <a href={proof.imageURL} target="_blank" rel="noopener noreferrer" className="shrink-0">
                <Image
                  src={proof.imageURL}
                  alt="Payment proof"
                  width={96}
                  height={96}
                  className="rounded object-cover"
                  unoptimized
                />
              </a>
              <div className="flex-1">
                <p className="font-medium">{proof.memberName}</p>
                {proof.amount != null && <p className="text-sm opacity-70">₱{proof.amount}</p>}
                <p className="text-xs opacity-60">{proof.submittedAt.toLocaleString()}</p>
                <div className="flex gap-2 mt-2">
                  <form
                    action={async () => {
                      "use server"
                      await approvePayment(proof.id, proof.uid)
                    }}
                  >
                    <button className="text-sm rounded-full bg-gdg-green text-white px-4 py-2">
                      Approve
                    </button>
                  </form>
                  <form
                    action={async () => {
                      "use server"
                      await rejectPayment(proof.id)
                    }}
                  >
                    <button className="text-sm rounded-full border-2 border-gdg-red text-gdg-red px-4 py-2">Reject</button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
