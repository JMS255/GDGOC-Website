"use client"

import { useRouter } from "next/navigation"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase/client"

export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" })
    await signOut(auth)
    router.push("/login")
    router.refresh()
  }

  return (
    <button onClick={handleLogout} className="text-sm underline opacity-70">
      Log out
    </button>
  )
}
