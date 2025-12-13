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
    async createProduct(data: CreateProductRequest): Promise<Product> {
        return fetchAPI<Product>("/api/Product", {
            method: "POST",
            body: JSON.stringify(data),
        })
    },

    /**
     * Update existing product
     */
    async updateProduct(id: number | string, data: CreateProductRequest): Promise<Product> {
        return fetchAPI<Product>(`/api/Product/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
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
