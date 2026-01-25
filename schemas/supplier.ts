import { z } from "zod"

export const supplierSchema = z.object({
    title: z.string().min(1, "Title is required"),
    contactPerson: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    address: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    metadata: z.object({
        vatNumber: z.string().optional().nullable(),
        taxId: z.string().optional().nullable(),
        notes: z.string().optional().nullable(),
    }).optional().nullable(),
})

export type SupplierFormValues = z.infer<typeof supplierSchema>

