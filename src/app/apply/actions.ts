"use server"

import { Timestamp } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import { ApplicationSchema, type ApplicationFormState } from "./definitions"

/**
 * Public, unauthenticated action — this is the actual start of the
 * membership pipeline now: apply first (no account), get interviewed,
 * and only get invited to sign in once approved (see
 * /api/auth/session, which gates account creation on an approved
 * application matching the sign-in email).
 */
export async function submitApplication(
  _state: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  const validated = ApplicationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    studentId: formData.get("studentId"),
    course: formData.get("course"),
    yearLevel: formData.get("yearLevel"),
    contactNumber: formData.get("contactNumber"),
    interests: formData.getAll("interests"),
    skills: formData.getAll("skills"),
    consentGiven: formData.get("consentGiven"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { fullName, email, studentId, course, yearLevel, contactNumber, interests, skills } = validated.data

  await adminDb.collection("applications").add({
    fullName,
    email,
    studentId,
    course,
    yearLevel,
    contactNumber,
    interests,
    skills,
    status: "new",
    interviewNotes: "",
    rating: null,
    convertedUid: null,
    createdAt: Timestamp.now(),
  })

  return {}
}
