import { fetchAPI } from "@/lib/api/client"
import type { Product, ProductListResponse, CreateProductRequest } from "@/types/product"

function normalizeProduct(p: Record<string, unknown>): Product {
    const taq = p.totalAvailableQuantity ?? p.TotalAvailableQuantity
    const low = p.hasLowStock ?? p.HasLowStock
    return {
        id: Number(p.id ?? p.Id ?? 0),
        title: String(p.title ?? p.Title ?? ""),
        code: String(p.code ?? p.Code ?? ""),
        price: Number(p.price ?? p.Price ?? 0),
        stock: Number(p.stock ?? p.Stock ?? 0),
        totalAvailableQuantity:
            taq === null || taq === undefined ? undefined : Number(taq),
        hasLowStock:
            low === null || low === undefined ? undefined : Boolean(low),
        categoryId: Number(p.categoryId ?? p.CategoryId ?? 0),
        createdAt: (p.createdAt ?? p.CreatedAt) as string | null | undefined,
        imageUrl: (p.imageUrl ?? p.ImageUrl) as string | null | undefined,
        metadata: (p.metadata ?? p.Metadata) as Product["metadata"],
        category: (p.category ?? p.Category) as Product["category"],
        isActive: Boolean(p.isActive ?? p.IsActive ?? true),
        hasVariations: p.hasVariations ?? p.HasVariations,
        variationOptions: (p.variationOptions ?? p.VariationOptions) as Product["variationOptions"],
        productVariants: (p.productVariants ?? p.ProductVariants) as Product["productVariants"],
    }
}

export const productAPI = {
    async getProducts(
        pageIndex: number = 1, 
        pageSize: number = 10, 
        searchText?: string, 
        sortBy?: string,
        categoryId?: number | null,
        status?: string | null,
        includeStock?: boolean
    ): Promise<ProductListResponse> {
        const params = new URLSearchParams({
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString(),
        })
        if (searchText) params.append("searchText", searchText)
        if (sortBy) params.append("sortBy", sortBy)
        if (categoryId && categoryId > 0) params.append("categoryId", categoryId.toString())
        if (status && status !== "all") params.append("status", status)
        if (includeStock) params.append("includeStock", "true")

        const raw = await fetchAPI<Record<string, unknown>>(`/api/Product?${params.toString()}`)
        const dataArray = raw?.data ?? raw?.Data
        const data = Array.isArray(dataArray) ? dataArray.map((p: Record<string, unknown>) => normalizeProduct(p)) : []
        const total = Number(raw?.total ?? raw?.Total ?? 0)
        const totalDisplay = Number(raw?.totalDisplay ?? raw?.TotalDisplay ?? raw?.total ?? raw?.Total ?? 0)
        return { data, total, totalDisplay }
    },

    async getProduct(id: number | string): Promise<Product> {
        const raw = await fetchAPI<Record<string, unknown>>(`/api/Product/${id}`)
        return raw ? normalizeProduct(raw) : (null as unknown as Product)
    },

    async createProduct(data: CreateProductRequest): Promise<Product> {
        return fetchAPI<Product>("/api/Product", {
            method: "POST",
            body: toFormData(data),
        })
    },

    async updateProduct(id: number | string, data: CreateProductRequest): Promise<Product> {
        const formData = toFormData(data)
        formData.append("Id", String(id))
        return fetchAPI<Product>(`/api/Product/${id}`, {
            method: "PUT",
            body: formData,
        })
    },

    async deactivateProduct(id: number | string): Promise<void> {
        const numericId = Number(id)
        if (!Number.isInteger(numericId) || numericId <= 0) return
        const product = await this.getProduct(numericId)
        const payload: CreateProductRequest = {
            title: product.title,
            code: product.code,
            price: product.price,
            stock: product.stock,
            categoryId: product.categoryId,
            imageUrl: product.imageUrl ?? undefined,
            metadata: product.metadata ?? undefined,
            isActive: false,
            parentId: (product as { parentId?: number }).parentId,
        }
        if (product.hasVariations && product.variationOptions?.length && product.productVariants?.length) {
            Object.assign(payload, {
                hasVariations: true,
                variationOptions: product.variationOptions,
                productVariants: product.productVariants.map((v) => ({
                    sku: v.sku,
                    price: v.price,
                    stock: v.stock,
                    isActive: v.isActive,
                    variationValueKeys: v.variationValues?.map((vv) => vv.value) ?? [],
                })),
            })
        }
        await this.updateProduct(id, payload as CreateProductRequest)
    },
}

function toFormData(data: any): FormData {
    const formData = new FormData()

    Object.keys(data).forEach((key) => {
        const value = data[key]
        
        // Only include HasVariations when true
        if (key === "hasVariations") {
            if (value === true) {
                formData.append("HasVariations", "true")
            }
            return
        }
        
        if (value === null || value === undefined) return

        if (key === "metadata" && typeof value === "object") {
            // Flatten metadata object to dot notation: Metadata.Description, etc.
            Object.keys(value).forEach((metaKey) => {
                const metaValue = value[metaKey]
                if (metaValue !== null && metaValue !== undefined) {
                    formData.append(`Metadata.${capitalize(metaKey)}`, String(metaValue))
                }
            })
        } else if (key === "imageUrl") {
            // Handle single file or array of files
            if (value instanceof File) {
                formData.append("Image", value)
            } else if (Array.isArray(value) && value.length > 0) {
                // If array, take first file
                const firstFile = value.find((item) => item instanceof File)
                if (firstFile) {
                    formData.append("Image", firstFile)
                }
            } else if (typeof value === "string" && value) {
                // Existing URL
                formData.append("ImageUrl", value)
            }
        } else if (key === "variationOptions" && Array.isArray(value)) {
            // Handle variation options array - only if array has items
            if (value.length > 0) {
                value.forEach((option, optIndex) => {
                    if (option && typeof option === "object") {
                        // Add option properties
                        if (option.name) {
                            formData.append(`VariationOptions[${optIndex}].Name`, String(option.name))
                        }
                        if (typeof option.displayOrder === "number") {
                            formData.append(`VariationOptions[${optIndex}].DisplayOrder`, String(option.displayOrder))
                        }
                        // Add values
                        if (Array.isArray(option.values)) {
                            option.values.forEach((val, valIndex) => {
                                if (val && typeof val === "object") {
                                    if (val.value) {
                                        formData.append(`VariationOptions[${optIndex}].Values[${valIndex}].Value`, String(val.value))
                                    }
                                    if (typeof val.displayOrder === "number") {
                                        formData.append(`VariationOptions[${optIndex}].Values[${valIndex}].DisplayOrder`, String(val.displayOrder))
                                    }
                                }
                            })
                        }
                    }
                })
            }
        } else if (key === "productVariants" && Array.isArray(value)) {
            // Handle product variants array - only if array has items
            if (value.length > 0) {
                value.forEach((variant, varIndex) => {
                    if (variant && typeof variant === "object") {
                        // Handle each variant property
                        if (variant.sku) {
                            formData.append(`ProductVariants[${varIndex}].Sku`, String(variant.sku))
                        }
                        if (typeof variant.price === "number") {
                            formData.append(`ProductVariants[${varIndex}].Price`, String(variant.price))
                        }
                        if (typeof variant.stock === "number") {
                            formData.append(`ProductVariants[${varIndex}].Stock`, String(variant.stock))
                        }
                        if (typeof variant.isActive === "boolean") {
                            formData.append(`ProductVariants[${varIndex}].IsActive`, String(variant.isActive))
                        }
                        // Handle variationValueKeys array
                        if (variant.variationValueKeys && Array.isArray(variant.variationValueKeys)) {
                            variant.variationValueKeys.forEach((key, keyIndex) => {
                                formData.append(`ProductVariants[${varIndex}].VariationValueKeys[${keyIndex}]`, String(key))
                            })
                        }
                    }
                })
            }
        } else {
            // Capitalize first letter for C# property naming convention
            const capitalizedKey = capitalize(key)
            formData.append(capitalizedKey, String(value))
        }
    })

    return formData
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}
