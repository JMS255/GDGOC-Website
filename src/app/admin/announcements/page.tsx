import { requireRole } from "@/lib/dal"
import { adminDb } from "@/lib/firebase/admin"
import { DEPT_HEAD_OR_ABOVE, type AnnouncementRecord } from "@/lib/types"
import { createAnnouncement, deleteAnnouncement } from "./actions"

async function getAnnouncements(): Promise<AnnouncementRecord[]> {
  const snapshot = await adminDb.collection("announcements").orderBy("createdAt", "desc").get()
  return snapshot.docs.map((doc) => {
    const data = doc.data()
    return { id: doc.id, title: data.title, body: data.body, createdAt: data.createdAt.toDate() }
  })
}

export default async function AdminAnnouncementsPage() {
  await requireRole(DEPT_HEAD_OR_ABOVE)
  const announcements = await getAnnouncements()

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Announcements</h1>

      <div className="grid lg:grid-cols-[320px_1fr] gap-10">
        <form action={createAnnouncement} className="flex flex-col gap-2">
          <input name="title" placeholder="Title" required className="border rounded px-3 py-2" />
          <textarea name="body" placeholder="Body" required rows={4} className="border rounded px-3 py-2" />
          <button className="rounded-full bg-gdg-blue text-white px-5 py-2 font-medium self-start">
            Post
          </button>
        </form>

        {announcements.length === 0 ? (
          <p className="opacity-60">Nothing posted yet.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-3 content-start">
            {announcements.map((a) => (
              <li key={a.id} className="border rounded-lg p-4">
                <p className="font-medium">{a.title}</p>
                <p className="text-sm opacity-80 mb-2">{a.body}</p>
                <form
                  action={async () => {
                    "use server"
                    await deleteAnnouncement(a.id)
                  }}
                >
                  <button className="text-xs rounded-full border-2 border-gdg-red text-gdg-red px-3 py-1.5">
                    Delete
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
