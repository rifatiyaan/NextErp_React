import { fetchAPI } from "./client"

export interface Supplier {
    id: number
    title: string
    contactPerson?: string
    phone?: string
    email?: string
    address?: string
    isActive: boolean
    createdAt: string
    updatedAt?: string
    tenantId: string
    branchId?: string
    metadata?: {
        vatNumber?: string
        taxId?: string
        notes?: string
    }
}

export interface SupplierCreateRequest {
    title: string
    contactPerson?: string
    phone?: string
    email?: string
    address?: string
    isActive?: boolean
    metadata?: {
        vatNumber?: string
        taxId?: string
        notes?: string
    }
}

export interface SupplierUpdateRequest extends SupplierCreateRequest {
    id: number
}

export interface SupplierListResponse {
    total: number
    totalDisplay: number
    data: Supplier[]
}

export const supplierAPI = {
    async getSuppliers(
        pageIndex: number = 1,
        pageSize: number = 10,
        searchText?: string,
        sortBy?: string
    ): Promise<SupplierListResponse> {
        const params = new URLSearchParams({
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString(),
        })
        if (searchText) params.append("searchText", searchText)
        if (sortBy) params.append("sortBy", sortBy)

        const response = await fetchAPI<{
            total: number
            totalDisplay: number
            data: Supplier[]
        }>(`/api/Supplier?${params.toString()}`)
        return {
            total: response.total,
            totalDisplay: response.totalDisplay,
            data: response.data,
        }
    },

    async getSupplierById(id: number): Promise<Supplier> {
        const response = await fetchAPI<Supplier>(`/api/Supplier/${id}`)
        return response
    },

    async createSupplier(data: SupplierCreateRequest): Promise<Supplier> {
        const response = await fetchAPI<Supplier>("/api/Supplier", {
            method: "POST",
            body: JSON.stringify(data),
        })
        return response
    },

    async updateSupplier(
        id: number,
        data: SupplierUpdateRequest
    ): Promise<void> {
        await fetchAPI(`/api/Supplier/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    },

    async deleteSupplier(id: number): Promise<void> {
        await fetchAPI(`/api/Supplier/${id}`, {
            method: "DELETE",
        })
    },
}

