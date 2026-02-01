import { z } from "zod"

// New variation system schemas
export const variationValueSchema = z.object({
    value: z.string().min(1, "Value is required"),
    displayOrder: z.number().default(0),
})

export const variationOptionSchema = z.object({
    name: z.string().min(1, "Option name is required"),
    displayOrder: z.number().default(0),
    values: z.array(variationValueSchema).min(1, "At least one value is required"),
})

export const productVariantSchema = z.object({
    sku: z.string().min(1, "SKU is required"),
    price: z.coerce.number().min(0, "Price must be positive"),
    stock: z.coerce.number().min(0, "Stock must be non-negative"),
    isActive: z.boolean().default(true),
    variationValueKeys: z.array(z.string()).min(1, "At least one variation value is required"),
})

export const productSchema = z.object({
    title: z.string().min(1, "Title is required"),
    code: z.string()
        .min(1, "SKU is required")
        .regex(/^[A-Za-z0-9]+$/, "SKU must be alphanumeric (letters and numbers only)"),
    price: z.coerce.number().min(0, "Price must be positive"),
    stock: z.coerce.number().min(0, "Stock must be non-negative").optional(),
    categoryId: z.coerce.number().min(1, "Category is required"),
    subCategoryId: z.coerce.number().optional(),
    imageUrl: z.union([z.instanceof(File), z.string(), z.array(z.instanceof(File)), z.array(z.string())]).optional().nullable().or(z.literal("")),
    isActive: z.boolean(),
    hasVariations: z.boolean().default(false),
    variationOptions: z.array(variationOptionSchema).optional(),
    productVariants: z.array(productVariantSchema).optional(),
    metadata: z.object({
        description: z.string().optional().nullable(),
        color: z.string().optional().nullable(),
        warranty: z.string().optional().nullable(),
    }).optional().nullable(),
}).refine(
    (data) => {
        if (data.hasVariations) {
            if (!data.variationOptions || data.variationOptions.length === 0) {
                return false
            }
            if (!data.productVariants || data.productVariants.length === 0) {
                return false
            }
        }
        return true
    },
    {
        message: "Variation options and variants are required when hasVariations is enabled",
        path: ["variationOptions"],
    }
)

export type ProductFormValues = z.infer<typeof productSchema>
export type VariationOptionFormValues = z.infer<typeof variationOptionSchema>
export type VariationValueFormValues = z.infer<typeof variationValueSchema>
export type ProductVariantFormValues = z.infer<typeof productVariantSchema>
