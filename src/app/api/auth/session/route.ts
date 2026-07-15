import { NextResponse } from "next/server"
import { FieldValue } from "firebase-admin/firestore"
import { adminAuth, adminDb } from "@/lib/firebase/admin"
import { createSession, deleteSession } from "@/lib/session"

const ALLOWED_EMAIL_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN ?? ""

/**
 * Exchanges a Firebase ID token for a session cookie — and is the ONLY place
 * the university-email-domain restriction is actually enforced. The client's
 * Google sign-in `hd` parameter (see lib/firebase/client.ts) is cosmetic only
 * and can be bypassed, so every sign-in must be re-checked here server-side
 * against the verified token before a session is ever created.
 */
export async function POST(request: Request) {
  const { idToken } = await request.json()
  if (typeof idToken !== "string" || !idToken) {
    return NextResponse.json({ error: "Missing idToken." }, { status: 400 })
  }

  let decoded
  try {
    decoded = await adminAuth.verifyIdToken(idToken)
  } catch {
    return NextResponse.json({ error: "Invalid ID token." }, { status: 401 })
  }

  const email = decoded.email
  const isAllowedDomain =
    !!email && !!decoded.email_verified && email.toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`)

  if (!isAllowedDomain) {
    // Don't leave a dangling Auth account for a rejected domain.
    await adminAuth.deleteUser(decoded.uid).catch(() => {})
    return NextResponse.json(
      { error: `Only @${ALLOWED_EMAIL_DOMAIN} accounts may sign in.` },
      { status: 403 }
    )
  }

  const userRef = adminDb.collection("users").doc(decoded.uid)
  const existing = await userRef.get()
  const isNewUser = !existing.exists

  if (isNewUser) {
    await userRef.set({
      email,
      displayName: decoded.name ?? null,
      photoURL: decoded.picture ?? null,
      role: "member",
      department: null,
      membershipStatus: "pending",
      membershipTier: "free",
      deletionRequested: false,
      deletionRequestedAt: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }

  await createSession(idToken)

  return NextResponse.json({ isNewUser })
}

export async function DELETE() {
  await deleteSession()
  return NextResponse.json({ success: true })
}
