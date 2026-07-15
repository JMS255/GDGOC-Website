import * as z from "zod"

export const MerchOrderSchema = z.object({
  buyerName: z.string().trim().min(2, { error: "Enter your name." }),
  buyerContact: z.string().trim().min(5, { error: "Enter a phone number or email we can reach you at." }),
  variant: z.string().trim().nullable(),
  quantity: z.coerce.number().int().min(1, { error: "Quantity must be at least 1." }),
})
