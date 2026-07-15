import "server-only"
import { cache } from "react"
import { redirect, forbidden } from "next/navigation"
import { adminAuth, adminDb } from "@/lib/firebase/admin"
import { getSessionCookieValue } from "@/lib/session"
import type { Role, UserRecord } from "@/lib/types"

/**
 * Verifies the session cookie itself (is this a real, non-revoked Firebase
 * session). Cached per-request so multiple callers during one render don't
 * re-verify the same cookie. Auth checks live here and in each page/action
 * that needs them — not in a route-group layout, since layouts don't
 * re-run on client-side navigations and a check there can be silently skipped.
 */
export const verifySession = cache(async (): Promise<{ uid: string; email: string }> => {
  const cookieValue = await getSessionCookieValue()
  if (!cookieValue) {
    redirect("/login")
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(cookieValue, true)
    if (!decoded.email) {
      redirect("/login")
    }
    return { uid: decoded.uid, email: decoded.email }
  } catch {
    redirect("/login")
  }
})

/**
 * Fetches the current user's role/status record. This is the DTO every
 * page/action should use instead of reading Firestore directly — keeps the
 * "who can see what" logic in one place.
 */
export const getCurrentUser = cache(async (): Promise<UserRecord> => {
  const { uid, email } = await verifySession()

  const snapshot = await adminDb.collection("users").doc(uid).get()
  if (!snapshot.exists) {
    // Session is valid but no user doc exists yet (shouldn't normally happen —
    // the /api/auth/session route creates it on first sign-in).
    redirect("/login")
  }

  const data = snapshot.data()!
  return {
    uid,
    email,
    displayName: data.displayName ?? null,
    role: data.role as Role,
    department: data.department ?? null,
    membershipStatus: data.membershipStatus,
    membershipTier: data.membershipTier,
  }
})

/** For pages that require an active (approved, non-lapsed) member. */
export async function requireActiveMember(): Promise<UserRecord> {
  const user = await getCurrentUser()
  if (user.membershipStatus !== "active") {
    redirect("/pending")
  }
  return user
}

/** For admin pages — 403s (not redirects) when the role doesn't qualify. */
export async function requireRole(allowedRoles: Role[]): Promise<UserRecord> {
  const user = await getCurrentUser()
  if (!allowedRoles.includes(user.role)) {
    forbidden()
  }
  return user
}
