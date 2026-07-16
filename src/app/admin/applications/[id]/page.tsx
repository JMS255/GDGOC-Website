import { notFound } from "next/navigation"
import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { DEPT_HEAD_OR_ABOVE } from "@/lib/types"
import { saveInterviewNotes, approveApplication, rejectApplication } from "./actions"
import { BackLink } from "@/components/back-link"

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  const { id } = await params

  const doc = await adminDb.collection("applications").doc(id).get()
  if (!doc.exists) notFound()
  const app = doc.data()!

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <BackLink href="/admin/applications" label="Applications" />
      <h1 className="text-2xl font-bold">{app.fullName}</h1>
      <p className="text-sm opacity-70 mb-1">{app.email}</p>
      <p className="text-sm opacity-70 mb-1">
        {app.course} · Year {app.yearLevel} · {app.studentId}
      </p>
      <p className="text-sm opacity-70 mb-1">Contact: {app.contactNumber}</p>
      <p className="text-sm opacity-70 mb-1">Interested in: {app.interests.join(", ")}</p>
      <p className="text-sm opacity-70 mb-6">
        {app.skills?.length > 0 ? `Skills: ${app.skills.join(", ")}` : "No specific skills selected."}
      </p>

      <p className="text-sm font-medium capitalize mb-6">Status: {app.status}</p>

      <h2 className="font-semibold mb-3">Interview</h2>
      <form
        action={async (formData: FormData) => {
          "use server"
          const ratingRaw = formData.get("rating")
          await saveInterviewNotes(
            id,
            String(formData.get("interviewNotes") ?? ""),
            ratingRaw ? Number(ratingRaw) : null
          )
        }}
        className="flex flex-col gap-2 mb-6 max-w-sm"
      >
        <label className="text-xs opacity-60">Notes</label>
        <textarea
          name="interviewNotes"
          defaultValue={app.interviewNotes ?? ""}
          className="border rounded px-3 py-2"
          rows={4}
        />
        <label className="text-xs opacity-60">Rating (1-5, optional)</label>
        <input
          type="number"
          name="rating"
          min={1}
          max={5}
          defaultValue={app.rating ?? ""}
          className="border rounded px-3 py-2"
        />
        <button className="rounded-full border px-5 py-2 font-medium self-start">Save notes</button>
      </form>

      {app.status === "new" && (
        <div className="flex gap-2">
          <form
            action={async () => {
              "use server"
              await approveApplication(id)
            }}
          >
            <button className="rounded-full bg-gdg-green text-white px-6 py-2.5 font-medium">
              Approve
            </button>
          </form>
          <form
            action={async () => {
              "use server"
              await rejectApplication(id)
            }}
          >
            <button className="rounded-full border-2 border-gdg-red text-gdg-red px-6 py-2.5 font-medium">Reject</button>
          </form>
        </div>
      )}

      {app.status === "approved" && (
        <p className="text-sm opacity-70">
          {app.convertedUid
            ? "This applicant has signed in and their account is active."
            : "Approved — waiting for them to sign in with Google to activate their account."}
        </p>
      )}
    </div>
  )
}
