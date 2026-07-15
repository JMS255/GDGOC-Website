"use server"

import { redirect } from "next/navigation"
import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import { getCurrentUser } from "@/lib/dal"
import { MemberProfileSchema, type MemberProfileFormState } from "./definitions"

export async function submitProfile(
  _state: MemberProfileFormState,
  formData: FormData
): Promise<MemberProfileFormState> {
  const user = await getCurrentUser()

  const validated = MemberProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    studentId: formData.get("studentId"),
    course: formData.get("course"),
    yearLevel: formData.get("yearLevel"),
    contactNumber: formData.get("contactNumber"),
    interests: formData.get("interests"),
    hearAboutUs: formData.get("hearAboutUs"),
    consentGiven: formData.get("consentGiven"),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { fullName, studentId, course, yearLevel, contactNumber, interests, hearAboutUs } =
    validated.data

  await adminDb
    .collection("memberProfiles")
    .doc(user.uid)
    .set({
      fullName,
      studentId,
      course,
      yearLevel,
      contactNumber,
      interests: interests.split(",").map((i) => i.trim()).filter(Boolean),
      hearAboutUs,
      consentGiven: true,
      consentTimestamp: FieldValue.serverTimestamp(),
      interviewNotes: null,
      submittedAt: FieldValue.serverTimestamp(),
    })

  redirect("/pending")
}
