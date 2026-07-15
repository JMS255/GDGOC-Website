import "server-only"
import { cookies } from "next/headers"
import { adminAuth } from "@/lib/firebase/admin"

export const SESSION_COOKIE_NAME = "__session"
const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

/**
 * Exchanges a freshly-signed-in Firebase ID token for a long-lived session
 * cookie and stores it. Firebase's session cookie mechanism (not a hand-rolled
 * JWT) so revocation/expiry is handled by Firebase Auth itself.
 */
export async function createSession(idToken: string): Promise<void> {
  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn: SESSION_MAX_AGE_MS,
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE_MS / 1000,
    path: "/",
  })
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function getSessionCookieValue(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE_NAME)?.value
}
