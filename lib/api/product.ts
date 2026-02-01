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
                formData.append("image", value)
            } else if (Array.isArray(value) && value.length > 0) {
                // If array, take first file
                const firstFile = value.find((item) => item instanceof File)
                if (firstFile) {
                    formData.append("image", firstFile)
                }
            } else if (typeof value === "string" && value) {
                // Existing URL
                formData.append("imageUrl", value)
            }
        } else if (key === "variationOptions" && Array.isArray(value)) {
            // Handle variation options array
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
        } else if (key === "productVariants" && Array.isArray(value)) {
            // Handle product variants array
            value.forEach((variant, varIndex) => {
                if (variant && typeof variant === "object") {
                    Object.keys(variant).forEach((variantKey) => {
                        const variantValue = variant[variantKey]
                        if (variantValue !== null && variantValue !== undefined) {
                            if (variantKey === "variationValueKeys" && Array.isArray(variantValue)) {
                                // Handle array of keys
                                variantValue.forEach((key, keyIndex) => {
                                    formData.append(`ProductVariants[${varIndex}].VariationValueKeys[${keyIndex}]`, String(key))
                                })
                            } else {
                                formData.append(`ProductVariants[${varIndex}].${capitalize(variantKey)}`, String(variantValue))
                            }
                        }
                    })
                }
            })
        } else {
            formData.append(key, String(value))
        }
    })

    return formData
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}
