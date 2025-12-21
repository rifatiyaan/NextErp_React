import { z } from "zod"

export const productSchema = z.object({
    title: z.string().min(1, "Title is required"),
    code: z.string().min(1, "Code is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
    categoryId: z.coerce.number().min(1, "Category is required"), // Assuming 0 is invalid or checking > 0
    imageUrl: z.union([z.instanceof(File), z.string()]).optional().nullable().or(z.literal("")),
    isActive: z.boolean(),
    metadata: z.object({
        description: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        warranty: z.string().optional().nullable(),
    }).optional().nullable(),
})

export type ProductFormValues = z.infer<typeof productSchema>
