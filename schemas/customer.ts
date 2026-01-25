import { z } from "zod"

export const customerSchema = z.object({
    title: z.string().min(1, "Title is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    metadata: z.object({
        loyaltyCode: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
        nationalId: z.string().optional().nullable(),
    }).optional().nullable(),
})

export type CustomerFormValues = z.infer<typeof customerSchema>

