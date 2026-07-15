import Link from "next/link"
import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { DEPT_HEAD_OR_ABOVE, type ApplicationRecord } from "@/lib/types"

async function getNewApplications(department: string | null): Promise<ApplicationRecord[]> {
  let query = adminDb.collection("applications").where("status", "==", "new")
  // Chief Exec / System Admin (no department) see everyone; a Department
  // Head only sees applicants who expressed interest in their own department.
  if (department) {
    query = query.where("interests", "array-contains", department)
  }
  const snapshot = await query.get()

  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      fullName: data.fullName,
      email: data.email,
      studentId: data.studentId,
      course: data.course,
      yearLevel: data.yearLevel,
      contactNumber: data.contactNumber,
      interests: data.interests,
      skills: data.skills ?? [],
      status: data.status,
      interviewNotes: data.interviewNotes,
      rating: data.rating,
      convertedUid: data.convertedUid,
      createdAt: data.createdAt.toDate(),
    }
  })
}

export default async function AdminApplicationsPage() {
  const admin = await requireRole(DEPT_HEAD_OR_ABOVE)
  const isDeptHeadOnly = admin.role === "department_head"
  const applications = await getNewApplications(isDeptHeadOnly ? admin.department : null)

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Applications</h1>
      <p className="text-sm opacity-70 mb-6">
        {isDeptHeadOnly ? `Showing applicants interested in ${admin.department}` : "Showing all new applicants"}
      </p>

      {applications.length === 0 ? (
        <p className="opacity-60">No applications to interview right now.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-3">
          {applications.map((app) => (
            <li key={app.id}>
              <Link
                href={`/admin/applications/${app.id}`}
                className="block border rounded-lg p-4 hover:bg-black/5"
              >
                <p className="font-medium">{app.fullName}</p>
                <p className="text-sm opacity-60">
                  {app.course} · Year {app.yearLevel}
                </p>
                <p className="text-xs opacity-60 mt-1">{app.interests.join(", ")}</p>
                {app.skills.length > 0 && (
                  <p className="text-xs opacity-60">Skills: {app.skills.join(", ")}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
