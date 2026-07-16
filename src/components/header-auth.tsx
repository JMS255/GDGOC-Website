"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { auth } from "@/lib/firebase/client"

export function HeaderAuth() {
  const router = useRouter()
  const [user, setUser] = useState<User | null | undefined>(undefined) // undefined = not resolved yet
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return onAuthStateChanged(auth, setUser)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  async function handleLogout() {
    await fetch("/api/auth/session", { method: "DELETE" })
    await signOut(auth)
    setIsOpen(false)
    router.push("/login")
    router.refresh()
  }

  if (!user) {
    return (
      <Link href="/login" className="hover:text-gdg-red transition-colors">
        Login
      </Link>
    )
  }

  const initial = (user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-8 h-8 rounded-full overflow-hidden border border-black/10 flex items-center justify-center bg-gdg-blue text-white text-sm font-medium"
        aria-label="Account menu"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element -- Google profile photo, not a whitelistable domain
          <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
        ) : (
          initial
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-64 rounded-lg border bg-background shadow-lg py-2 z-20">
          <div
            aria-hidden
            className="absolute -top-1.5 right-2 w-3 h-3 bg-background border-t border-l rotate-45"
          />
          <div className="px-4 py-2 border-b">
            <p className="text-sm font-medium truncate">{user.displayName ?? "Member"}</p>
            <p className="text-xs opacity-60 truncate">{user.email}</p>
          </div>
          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm hover:bg-black/5"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/membership"
            className="block px-4 py-2 text-sm hover:bg-black/5"
            onClick={() => setIsOpen(false)}
          >
            Membership
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-black/5 text-gdg-red"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  )
}
