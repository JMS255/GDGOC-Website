import "server-only"
import { getApps, getApp, initializeApp, cert, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

/**
 * Prefers a single base64-encoded service account JSON blob
 * (FIREBASE_SERVICE_ACCOUNT_BASE64) over three separate env vars — a
 * multi-line private key with \n escapes is fragile to paste into a web
 * form (Vercel, etc.); base64 has no newlines or special characters to
 * mangle, so it survives copy-paste intact.
 */
function getCredential() {
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64
  if (encoded) {
    const serviceAccount = JSON.parse(Buffer.from(encoded, "base64").toString("utf-8"))
    return cert(serviceAccount)
  }

  return cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  })
}

function getAdminApp(): App {
  if (getApps().length) return getApp()
  return initializeApp({ credential: getCredential() })
}

export const adminApp = getAdminApp()
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
