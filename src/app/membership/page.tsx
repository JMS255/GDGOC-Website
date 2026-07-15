import { requireActiveMember } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { PaymentProofForm } from "./payment-proof-form"

async function getLatestProofStatus(uid: string): Promise<"pending" | "rejected" | null> {
  const snapshot = await adminDb
    .collection("paymentProofs")
    .where("uid", "==", uid)
    .orderBy("submittedAt", "desc")
    .limit(1)
    .get()

  if (snapshot.empty) return null
  const status = snapshot.docs[0].data().status
  return status === "pending" || status === "rejected" ? status : null
}

export default async function MembershipPage() {
  const user = await requireActiveMember()
  const latestProofStatus = user.membershipTier === "free" ? await getLatestProofStatus(user.uid) : null

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Membership</h1>
      <p className="text-sm opacity-70 mb-8 capitalize">
        {user.membershipTier} tier · {user.membershipStatus}
      </p>

      {user.membershipTier === "paid" && (
        <p className="text-sm">You&apos;re on the paid tier. Thanks for supporting GDGoC!</p>
      )}

      {user.membershipTier === "free" && latestProofStatus === "pending" && (
        <p className="text-sm opacity-70">
          Your payment proof is under review. We&apos;ll update your tier once it&apos;s approved.
        </p>
      )}

      {user.membershipTier === "free" && latestProofStatus !== "pending" && (
        <>
          {latestProofStatus === "rejected" && (
            <p className="text-sm text-red-600 mb-4">
              Your last submission was rejected. You can submit a new one below.
            </p>
          )}
          <h2 className="font-semibold mb-3">Upgrade to paid tier</h2>
          <PaymentProofForm />
        </>
      )}
    </div>
  )
}
