import { fetchAPI } from "./client"

export interface Supplier {
    id: string
    title: string
    contactPerson?: string
    phone?: string
    email?: string
    address?: string
    vatNumber?: string
    taxId?: string
    notes?: string
    partyType: number
    isActive: boolean
    createdAt: string
    updatedAt?: string
    tenantId: string
    branchId: string
}

export interface SupplierCreateRequest {
    title: string
    contactPerson?: string
    phone?: string
    email?: string
    address?: string
    vatNumber?: string
    taxId?: string
    notes?: string
    isActive?: boolean
    partyType?: number
}

export interface SupplierUpdateRequest extends SupplierCreateRequest {
    id: string
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
        sortBy?: string,
        signal?: AbortSignal
    ): Promise<SupplierListResponse> {
        const params = new URLSearchParams({
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString(),
            type: "Supplier",
        })
        if (searchText) params.append("searchText", searchText)
        if (sortBy) params.append("sortBy", sortBy)

        return await fetchAPI<SupplierListResponse>(`/api/Party?${params.toString()}`, { signal })
    },

    async getSupplierById(id: string, signal?: AbortSignal): Promise<Supplier> {
        return await fetchAPI<Supplier>(`/api/Party/${id}`, { signal })
    },

    async createSupplier(data: SupplierCreateRequest): Promise<Supplier> {
        return await fetchAPI<Supplier>("/api/Party", {
            method: "POST",
            body: JSON.stringify({ ...data, partyType: 1 }),
        })
    },

    async updateSupplier(id: string, data: SupplierUpdateRequest): Promise<void> {
        await fetchAPI(`/api/Party/${id}`, {
            method: "PUT",
            body: JSON.stringify({ ...data, partyType: 1 }),
        })
    },

    async deactivateSupplier(id: string): Promise<void> {
        const supplier = await this.getSupplierById(id)
        await this.updateSupplier(id, { ...supplier, isActive: false })
    },
}
