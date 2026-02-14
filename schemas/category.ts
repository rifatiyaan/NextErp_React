import { z } from "zod"

export const categorySchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional().nullable(),
    parentId: z.number().nullable().optional(),
    metadata: z.any().optional(),
    images: z.union([z.instanceof(File), z.array(z.instanceof(File))]).optional().nullable(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>
