import { notFound } from "next/navigation"
import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { DEPT_HEAD_OR_ABOVE, type ResponsibilityRecord, type PerformanceReviewRecord } from "@/lib/types"
import { assignResponsibility, setResponsibilityStatus, submitPerformanceReview } from "./actions"

async function getResponsibilities(uid: string): Promise<ResponsibilityRecord[]> {
  const snapshot = await adminDb
    .collection("responsibilities")
    .where("assignedTo", "==", uid)
    .orderBy("createdAt", "desc")
    .get()

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      assignedTo: data.assignedTo,
      assignedBy: data.assignedBy,
      title: data.title,
      dueDate: data.dueDate ? data.dueDate.toDate() : null,
      status: data.status,
      createdAt: data.createdAt.toDate(),
    }
  })
}

async function getReviews(uid: string): Promise<PerformanceReviewRecord[]> {
  const snapshot = await adminDb
    .collection("performanceReviews")
    .where("uid", "==", uid)
    .orderBy("createdAt", "desc")
    .get()

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      uid: data.uid,
      termId: data.termId,
      reviewedBy: data.reviewedBy,
      rating: data.rating,
      note: data.note,
      createdAt: data.createdAt.toDate(),
    }
  })
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

export default async function AdminMemberDetailPage({
  params,
}: {
  params: Promise<{ uid: string }>
}) {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  const { uid } = await params

  const userDoc = await adminDb.collection("users").doc(uid).get()
  if (!userDoc.exists) notFound()
  const user = userDoc.data()!

  const [responsibilities, reviews, activeTerm] = await Promise.all([
    getResponsibilities(uid),
    getReviews(uid),
    getActiveTerm(),
  ])

  const hasReviewedThisTerm = activeTerm ? reviews.some((r) => r.termId === activeTerm.id) : false

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold">{user.displayName ?? user.email}</h1>
      <p className="text-sm opacity-70 mb-8 capitalize">
        {user.email} · {user.role.replace("_", " ")} · {user.membershipStatus} · {user.membershipTier} tier
      </p>

      <section className="mb-10">
        <h2 className="font-semibold mb-3">Responsibilities</h2>
        <form
          action={async (formData: FormData) => {
            "use server"
            await assignResponsibility(
              uid,
              String(formData.get("title") ?? ""),
              (formData.get("dueDate") as string) || null
            )
          }}
          className="flex flex-col gap-2 mb-4 max-w-sm"
        >
          <input name="title" placeholder="e.g. Handle registration desk" className="border rounded px-3 py-2" />
          <input type="date" name="dueDate" className="border rounded px-3 py-2" />
          <button className="rounded-full bg-foreground text-background px-5 py-2 font-medium self-start">
            Assign
          </button>
        </form>

        {responsibilities.length === 0 ? (
          <p className="text-sm opacity-60">No responsibilities assigned yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {responsibilities.map((r) => (
              <li key={r.id} className="border rounded-lg p-3 flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <p className="text-xs opacity-60 capitalize">
                    {r.status}
                    {r.dueDate && ` · due ${r.dueDate.toLocaleDateString()}`}
                  </p>
                </div>
                {r.status === "assigned" && (
                  <div className="flex gap-2 shrink-0">
                    <form
                      action={async () => {
                        "use server"
                        await setResponsibilityStatus(r.id, uid, "done")
                      }}
                    >
                      <button className="text-xs rounded-full bg-foreground text-background px-3 py-1.5">
                        Done
                      </button>
                    </form>
                    <form
                      action={async () => {
                        "use server"
                        await setResponsibilityStatus(r.id, uid, "missed")
                      }}
                    >
                      <button className="text-xs rounded-full border px-3 py-1.5">Missed</button>
                    </form>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-semibold mb-3">Performance Reviews</h2>

        {!activeTerm && (
          <p className="text-sm opacity-60 mb-4">
            No active term — create/activate one in /admin/terms to submit a review.
          </p>
        )}
        {activeTerm && hasReviewedThisTerm && (
          <p className="text-sm opacity-60 mb-4">Already reviewed for {activeTerm.label}.</p>
        )}
        {activeTerm && !hasReviewedThisTerm && (
          <form
            action={async (formData: FormData) => {
              "use server"
              await submitPerformanceReview(
                uid,
                activeTerm.id,
                Number(formData.get("rating")),
                String(formData.get("note") ?? "")
              )
            }}
            className="flex flex-col gap-2 mb-6 max-w-sm"
          >
            <label className="text-xs opacity-60">Rating for {activeTerm.label} (1-5)</label>
            <input type="number" name="rating" min={1} max={5} required className="border rounded px-3 py-2" />
            <textarea name="note" placeholder="Short note" className="border rounded px-3 py-2" />
            <button className="rounded-full bg-foreground text-background px-5 py-2 font-medium self-start">
              Submit review
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-sm opacity-60">No reviews yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {reviews.map((review) => (
              <li key={review.id} className="border rounded-lg p-3">
                <p className="font-medium">Rating: {review.rating}/5</p>
                {review.note && <p className="text-sm opacity-80">{review.note}</p>}
                <p className="text-xs opacity-60 mt-1">{review.createdAt.toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
