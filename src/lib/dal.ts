import "server-only"
import { cache } from "react"
import { redirect, forbidden } from "next/navigation"
import { adminAuth, adminDb } from "@/lib/firebase/admin"
import { getSessionCookieValue } from "@/lib/session"
import type { Role, UserRecord } from "@/lib/types"

/**
 * Resolves the signed-in user's record, or null if there isn't one — used by
 * both the strict (redirect/forbidden) and optional (public-page
 * personalization) variants below, so the actual cookie/Firestore lookup
 * only lives in one place.
 */
async function resolveUser(): Promise<UserRecord | null> {
  const cookieValue = await getSessionCookieValue()
  if (!cookieValue) return null

  try {
    const decoded = await adminAuth.verifySessionCookie(cookieValue, true)
    if (!decoded.email) return null

    const snapshot = await adminDb.collection("users").doc(decoded.uid).get()
    if (!snapshot.exists) return null

    const data = snapshot.data()!
    return {
      uid: decoded.uid,
      email: decoded.email,
      displayName: data.displayName ?? null,
      role: data.role as Role,
      department: data.department ?? null,
      membershipStatus: data.membershipStatus,
      membershipTier: data.membershipTier,
    }
  } catch {
    return null
  }
}

/**
 * For public pages that personalize when signed in but must still render for
 * everyone else (e.g. showing an RSVP button only to signed-in members).
 */
export const getOptionalUser = cache(resolveUser)

/**
 * Fetches the current user's role/status record, redirecting to /login if
 * there isn't one. This is the DTO every protected page/action should use
 * instead of reading Firestore directly — keeps the "who can see what" logic
 * in one place. Auth checks live here and in each page/action that needs
 * them — not in a route-group layout, since layouts don't re-run on
 * client-side navigations and a check there can be silently skipped.
 */
export const getCurrentUser = cache(async (): Promise<UserRecord> => {
  const user = await resolveUser()
  if (!user) redirect("/login")
  return user
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
