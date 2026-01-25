import { z } from "zod"

export const variantSchema = z.object({
    option: z.string().optional(),
    value: z.string().optional(),
    price: z.coerce.number().optional(),
})

export const productSchema = z.object({
    title: z.string().min(1, "Title is required"),
    code: z.string().min(1, "Code is required"),
    barcode: z.string().optional(),
    price: z.coerce.number().min(0, "Price must be positive"),
    discountedPrice: z.coerce.number().min(0, "Discounted price must be positive").optional(),
    stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
    categoryId: z.coerce.number().min(1, "Category is required"),
    subCategoryId: z.coerce.number().optional(),
    imageUrl: z.union([z.instanceof(File), z.string(), z.array(z.instanceof(File)), z.array(z.string())]).optional().nullable().or(z.literal("")),
    isActive: z.boolean(),
    chargeTax: z.boolean().default(false),
    inStock: z.boolean().default(true),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    variants: z.array(variantSchema).optional(),
    metadata: z.object({
        description: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        warranty: z.string().optional().nullable(),
    }).optional().nullable(),
})

export type ProductFormValues = z.infer<typeof productSchema>
export type VariantFormValues = z.infer<typeof variantSchema>
