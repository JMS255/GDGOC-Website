"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithPopup, signOut } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase/client"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isSigningIn, setIsSigningIn] = useState(false)

  async function handleGoogleSignIn() {
    setError(null)
    setIsSigningIn(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const idToken = await result.user.getIdToken()

      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Sign-in failed." }))
        await signOut(auth)
        setError(body.error ?? "Sign-in failed.")
        return
      }

      const { isNewUser } = await response.json()
      router.push(isNewUser ? "/signup" : "/dashboard")
      router.refresh()
    } catch {
      setError("Something went wrong signing in. Please try again.")
    } finally {
      setIsSigningIn(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-24 flex flex-col items-center gap-6 text-center">
      <h1 className="text-2xl font-bold">Sign in to GDGoC</h1>
      <p className="text-sm opacity-70">
        Use your Adzu Google account (@adzu.edu.ph) to sign in or apply for membership.
      </p>
      <button
        onClick={handleGoogleSignIn}
        disabled={isSigningIn}
        className="rounded-full bg-foreground text-background px-6 py-3 font-medium disabled:opacity-50"
      >
        {isSigningIn ? "Signing in…" : "Sign in with Google"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
