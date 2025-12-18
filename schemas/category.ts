import { z } from "zod"

export const categorySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable(),
    parentId: z.number().nullable().optional(),
    isActive: z.boolean(),
    metadata: z.any().optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
