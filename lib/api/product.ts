import { fetchAPI } from "@/lib/api/client"
import type { Product, ProductListResponse, CreateProductRequest } from "@/types/product"

export const productAPI = {
    /**
     * Get paginated products
     */
    async getProducts(pageIndex: number = 1, pageSize: number = 10, searchText?: string, sortBy?: string): Promise<ProductListResponse> {
        // Construct query string manually or use URLSearchParams
        const params = new URLSearchParams({
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString(),
        })
        if (searchText) params.append("searchText", searchText)
        if (sortBy) params.append("sortBy", sortBy)

        return fetchAPI<ProductListResponse>(`/api/Product?${params.toString()}`)
    },

    /**
     * Get single product by ID
     */
    async getProduct(id: number | string): Promise<Product> {
        return fetchAPI<Product>(`/api/Product/${id}`)
    },

    /**
     * Create new product
     */
    /**
     * Create new product
     */
    async createProduct(data: CreateProductRequest): Promise<Product> {
        return fetchAPI<Product>("/api/Product", {
            method: "POST",
            body: toFormData(data),
        })
    },

    /**
     * Update existing product
     */
    async updateProduct(id: number | string, data: CreateProductRequest): Promise<Product> {
        return fetchAPI<Product>(`/api/Product/${id}`, {
            method: "PUT",
            body: toFormData(data),
        })
    },

    /**
     * Delete product
     */
    async deleteProduct(id: number | string): Promise<void> {
        return fetchAPI<void>(`/api/Product/${id}`, {
            method: "DELETE",
        })
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
