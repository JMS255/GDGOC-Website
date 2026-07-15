import * as z from "zod"

export const EventFormSchema = z
  .object({
    title: z.string().trim().min(2, { error: "Enter a title." }),
    description: z.string().trim().min(2, { error: "Enter a description." }),
    department: z.string().trim().min(2, { error: "Enter the organizing department." }),
    location: z.string().trim().min(2, { error: "Enter a location." }),
    startsAt: z.string().min(1, { error: "Pick a start time." }),
    endsAt: z.string().min(1, { error: "Pick an end time." }),
  })
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    error: "End time must be after the start time.",
    path: ["endsAt"],
  })

export type EventFormState =
  | {
      errors?: Partial<Record<keyof z.infer<typeof EventFormSchema>, string[]>>
    }
  | undefined
