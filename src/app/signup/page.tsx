import { getCurrentUser } from "@/lib/dal"
import { SignupForm } from "./signup-form"

export default async function SignupPage() {
  // Ensures the visitor is signed in (redirects to /login otherwise) before
  // showing the profile-completion form.
  await getCurrentUser()

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">Complete your profile</h1>
      <p className="text-sm opacity-70 mb-6">
        This is the last step before your membership application is reviewed.
      </p>
      <SignupForm />
    </div>
  )
}
