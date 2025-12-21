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
            // Note: server expects "Metadata" (capitalized?) or standard binding. 
            // Usually standard binding is case-insensitive, but nested keys need to match structure.
            // Requirement was: "Flatten the metadata object into dot-notation keys (e.g., append Metadata.Description..."
            Object.keys(value).forEach((metaKey) => {
                const metaValue = value[metaKey]
                if (metaValue !== null && metaValue !== undefined) {
                    // Start with 'Metadata' capitalized to be safe/follow request, though 'metadata' usually works too.
                    // Request said: "append Metadata.Description"
                    formData.append(`Metadata.${capitalize(metaKey)}`, String(metaValue))
                }
            })
        } else if (key === "imageUrl") {
            // If it's a File, append as 'image' (per request: "Append the selected file to the 'image' key")
            // If it's a string, we might just ignore it or send it if needed. 
            // Request said: "Old Field: 'imageUrl' (string) is now handled automatically by the backend upon upload."
            // So if we have a file, we send it as 'image'.
            if (value instanceof File) {
                formData.append("image", value)
            }
            // If it's a string, it's the existing URL. We probably don't need to send it if it's not changing, 
            // or send it as 'imageUrl' if the backend still accepts it for some reason? 
            // Request says "Old Field: 'imageUrl' (string) is now handled automatically...". 
            // Assuming we only send 'image' if new file.
        } else {
            formData.append(key, String(value))
        }
    })

    return formData
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}
