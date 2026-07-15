import { getCurrentUser } from "@/lib/dal"
import { redirect } from "next/navigation"

export default async function PendingPage() {
  const user = await getCurrentUser()

  // Active members shouldn't be stuck looking at the pending screen.
  if (user.membershipStatus === "active") {
    redirect("/dashboard")
  }

  const statusCopy: Record<string, string> = {
    pending: "Your application is being reviewed. A department head will reach out to schedule your interview.",
    rejected: "Your application was not approved this cycle. Reach out to the Events Department if you have questions.",
    expired: "Your membership has expired. Renew from your membership page once it's available.",
  }

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-4">
        {user.membershipStatus === "pending" ? "Application received" : "Membership status"}
      </h1>
      <p className="opacity-80">{statusCopy[user.membershipStatus]}</p>
    </div>
  )
}
