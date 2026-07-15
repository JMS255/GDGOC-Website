import * as z from "zod"

export const MemberProfileSchema = z.object({
  fullName: z.string().trim().min(2, { error: "Enter your full name." }),
  studentId: z.string().trim().min(3, { error: "Enter a valid student ID." }),
  course: z.string().trim().min(2, { error: "Enter your course." }),
  yearLevel: z.coerce.number().int().min(1).max(5, { error: "Enter a year level 1-5." }),
  contactNumber: z.string().trim().min(7, { error: "Enter a valid contact number." }),
  interests: z.string().trim().min(1, { error: "Tell us at least one interest." }),
  hearAboutUs: z.string().trim().min(1, { error: "Let us know how you heard about us." }),
  consentGiven: z.literal("on", {
    error: "You must consent to data collection to continue.",
  }),
})

export type MemberProfileFormState =
  | {
      errors?: Partial<Record<keyof z.infer<typeof MemberProfileSchema>, string[]>>
      message?: string
    }
  | undefined
