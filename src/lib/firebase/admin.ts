import "server-only"
import { getApps, getApp, initializeApp, cert, type App } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function getAdminApp(): App {
  if (getApps().length) return getApp()

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Service account JSON stores the private key with literal "\n" escapes.
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

export const adminApp = getAdminApp()
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
