import { requireActiveMember } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { PaymentProofForm } from "./payment-proof-form"
import { renewFree } from "./actions"

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

async function getActiveTerm(): Promise<{ id: string; label: string } | null> {
  const snapshot = await adminDb
    .collection("membershipTerms")
    .where("isActive", "==", true)
    .limit(1)
    .get()
  if (snapshot.empty) return null
  return { id: snapshot.docs[0].id, label: snapshot.docs[0].data().label }
}

async function getRenewalStatus(
  uid: string,
  termId: string
): Promise<"pending" | "approved" | "rejected" | null> {
  const snapshot = await adminDb
    .collection("membershipRenewals")
    .where("uid", "==", uid)
    .where("termId", "==", termId)
    .limit(1)
    .get()
  return snapshot.empty ? null : snapshot.docs[0].data().status
}

export default async function MembershipPage() {
  const user = await requireActiveMember()
  const latestProofStatus = user.membershipTier === "free" ? await getLatestProofStatus(user.uid) : null
  const activeTerm = await getActiveTerm()
  const renewalStatus = activeTerm ? await getRenewalStatus(user.uid, activeTerm.id) : null

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Membership</h1>
      <p className="text-sm opacity-70 mb-8 capitalize">
        {user.membershipTier} tier · {user.membershipStatus}
      </p>

      {activeTerm && (
        <section className="mb-8 border-t pt-6">
          <h2 className="font-semibold mb-3">{activeTerm.label}</h2>
          {renewalStatus === "approved" && (
            <p className="text-sm">Renewed for this term ✓</p>
          )}
          {renewalStatus === "pending" && (
            <p className="text-sm opacity-70">Your renewal payment is under review.</p>
          )}
          {(renewalStatus === null || renewalStatus === "rejected") && (
            <>
              {renewalStatus === "rejected" && (
                <p className="text-sm text-red-600 mb-3">
                  Your last renewal submission was rejected. You can try again below.
                </p>
              )}
              {user.membershipTier === "free" ? (
                <form
                  action={async () => {
                    "use server"
                    await renewFree(activeTerm.id)
                  }}
                >
                  <button className="rounded-full bg-gdg-blue text-white px-6 py-2.5 font-medium">
                    Renew (Free)
                  </button>
                </form>
              ) : (
                <PaymentProofForm termId={activeTerm.id} />
              )}
            </>
          )}
        </section>
      )}

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
