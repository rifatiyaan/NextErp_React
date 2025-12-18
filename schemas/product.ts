import { z } from "zod"

export const productSchema = z.object({
    title: z.string().min(1, "Title is required"),
    code: z.string().min(1, "Code is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
    categoryId: z.coerce.number().min(1, "Category is required"), // Assuming 0 is invalid or checking > 0
    imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
    isActive: z.boolean(),
    metadata: z.object({
        description: z.string().optional(),
        color: z.string().optional(),
        warranty: z.string().optional(),
    }).optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>
