import { redirect } from "next/navigation"
import { getOptionalUser } from "@/lib/dal"
import { LoginForm } from "./login-form"

export default async function LoginPage() {
  // If there's already a valid session, don't show the sign-in screen again —
  // send them straight to where that session actually belongs.
  const user = await getOptionalUser()
  if (user) {
    redirect(user.membershipStatus === "active" ? "/dashboard" : "/pending")
  }

  return <LoginForm />
}
