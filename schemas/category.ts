import { z } from "zod"

export const categorySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    parentId: z.coerce.number().optional().nullable(),
    isActive: z.boolean().default(true),
    metadata: z.any().optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
