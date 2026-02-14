import { fetchAPI } from "@/lib/api/client"
import type { Category, CategoryListResponse, CreateCategoryRequest } from "@/types/category"

function toFormData(data: CreateCategoryRequest): FormData {
    const formData = new FormData()
    
    formData.append("Title", data.title)
    if (data.description) {
        formData.append("Description", data.description)
    }
    if (data.parentId) {
        formData.append("ParentId", data.parentId.toString())
    }
    if (data.metadata) {
        formData.append("Metadata", JSON.stringify(data.metadata))
    }
    
    // Handle images array
    if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
            formData.append(`Images`, image)
        })
    }
    
    return formData
}

export const categoryAPI = {
    /**
     * Get paginated categories
     */
    async getCategories(pageIndex: number = 1, pageSize: number = 10, searchText?: string, sortBy?: string): Promise<CategoryListResponse> {
        const params = new URLSearchParams({
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString(),
        })
        if (searchText) params.append("searchText", searchText)
        if (sortBy) params.append("sortBy", sortBy)

        return fetchAPI<CategoryListResponse>(`/api/Category?${params.toString()}`)
    },

    /**
     * Get single category by ID
     */
    async getCategory(id: number | string): Promise<Category> {
        return fetchAPI<Category>(`/api/Category/${id}`)
    },

    /**
     * Create new category
     */
    async createCategory(data: CreateCategoryRequest): Promise<Category> {
        const formData = toFormData(data)
        return fetchAPI<Category>("/api/Category", {
            method: "POST",
            body: formData,
        })
    },

    /**
     * Update existing category
     */
    async updateCategory(id: number | string, data: CreateCategoryRequest): Promise<Category> {
        const formData = toFormData(data)
        return fetchAPI<Category>(`/api/Category/${id}`, {
            method: "PUT",
            body: formData,
        })
    },

    /**
     * Delete category
     */
    async deleteCategory(id: number | string): Promise<void> {
        return fetchAPI<void>(`/api/Category/${id}`, {
            method: "DELETE",
        })
    },

    /**
     * Get all categories (for dropdowns)
     * Assuming backend supports a 'all' or high pageSize, or a specific endpoint
     * For now, fetching a large page size
     */
    async getAllCategories(): Promise<Category[]> {
        const response = await this.getCategories(1, 1000)
        return response.data
    }
}
