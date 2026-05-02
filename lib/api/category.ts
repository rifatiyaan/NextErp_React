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
    if (typeof data.isActive === "boolean") {
        formData.append("IsActive", data.isActive ? "true" : "false")
    }
    if (data.metadata) {
        formData.append("Metadata", JSON.stringify(data.metadata))
    }
    
    // Handle images array
    if (data.images && data.images.length > 0) {
        data.images.forEach((image) => {
            formData.append("Images", image)
        })
    }
    
    return formData
}

export const categoryAPI = {
    async getCategories(pageIndex: number = 1, pageSize: number = 10, searchText?: string, sortBy?: string, signal?: AbortSignal): Promise<CategoryListResponse> {
        const params = new URLSearchParams({
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString(),
        })
        if (searchText) params.append("searchText", searchText)
        if (sortBy) params.append("sortBy", sortBy)

        return fetchAPI<CategoryListResponse>(`/api/Category?${params.toString()}`, { signal })
    },

    async getCategory(id: number | string, signal?: AbortSignal): Promise<Category> {
        return fetchAPI<Category>(`/api/Category/${id}`, { signal })
    },

    async createCategory(data: CreateCategoryRequest): Promise<Category> {
        const formData = toFormData(data)
        return fetchAPI<Category>("/api/Category", {
            method: "POST",
            body: formData,
        })
    },

    async updateCategory(id: number | string, data: CreateCategoryRequest): Promise<Category> {
        const formData = toFormData(data)
        return fetchAPI<Category>(`/api/Category/${id}`, {
            method: "PUT",
            body: formData,
        })
    },

    async deactivateCategory(id: number | string): Promise<void> {
        const category = await this.getCategory(id)
        await this.updateCategory(id, {
            title: category.title,
            description: category.description ?? undefined,
            parentId: category.parentId ?? undefined,
            metadata: category.metadata,
            isActive: false,
        })
    },

    async getAllCategories(signal?: AbortSignal): Promise<Category[]> {
        const response = await this.getCategories(1, 1000, undefined, undefined, signal)
        return response.data
    }
}
