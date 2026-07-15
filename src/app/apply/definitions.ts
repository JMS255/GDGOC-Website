import * as z from "zod"
import { ALL_SKILLS } from "@/lib/department-info"

const ALLOWED_EMAIL_DOMAIN = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN ?? ""

export const ApplicationSchema = z.object({
  fullName: z.string().trim().min(2, { error: "Enter your full name." }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email({ error: "Enter a valid email." })
    .refine((email) => email.endsWith(`@${ALLOWED_EMAIL_DOMAIN}`), {
      error: `Use your @${ALLOWED_EMAIL_DOMAIN} email.`,
    }),
  studentId: z.string().trim().min(3, { error: "Enter a valid student ID." }),
  course: z.string().trim().min(2, { error: "Enter your course." }),
  yearLevel: z.coerce.number().int().min(1).max(5, { error: "Enter a year level 1-5." }),
  contactNumber: z.string().trim().min(7, { error: "Enter a valid contact number." }),
  interests: z.array(z.string()).min(1, { error: "Select at least one interest." }),
  skills: z.array(z.enum(ALL_SKILLS)),
  consentGiven: z.literal("on", {
    error: "You must consent to data collection to continue.",
  }),
})

export type ApplicationFormState =
  | {
      errors?: Partial<Record<keyof z.infer<typeof ApplicationSchema>, string[]>>
    }
  | undefined
