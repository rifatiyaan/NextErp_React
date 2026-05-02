import { fetchAPI } from "./client"

export interface Customer {
    id: string
    title: string
    email?: string
    phone?: string
    address?: string
    loyaltyCode?: string
    nationalId?: string
    notes?: string
    partyType: number
    isActive: boolean
    createdAt: string
    updatedAt?: string
    tenantId: string
    branchId: string
}

export interface CustomerCreateRequest {
    title: string
    email?: string
    phone?: string
    address?: string
    loyaltyCode?: string
    nationalId?: string
    notes?: string
    isActive?: boolean
    partyType?: number
}

export interface CustomerUpdateRequest extends CustomerCreateRequest {
    id: string
}

export interface CustomerListResponse {
    total: number
    totalDisplay: number
    data: Customer[]
}

export const customerAPI = {
    async getCustomers(
        pageIndex: number = 1,
        pageSize: number = 10,
        searchText?: string,
        sortBy?: string,
        signal?: AbortSignal
    ): Promise<CustomerListResponse> {
        const params = new URLSearchParams({
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString(),
            type: "Customer",
        })
        if (searchText) params.append("searchText", searchText)
        if (sortBy) params.append("sortBy", sortBy)

        return await fetchAPI<CustomerListResponse>(`/api/Party?${params.toString()}`, { signal })
    },

    async getCustomerById(id: string, signal?: AbortSignal): Promise<Customer> {
        return await fetchAPI<Customer>(`/api/Party/${id}`, { signal })
    },

    async createCustomer(data: CustomerCreateRequest): Promise<Customer> {
        return await fetchAPI<Customer>("/api/Party", {
            method: "POST",
            body: JSON.stringify({ ...data, partyType: 0 }),
        })
    },

    async updateCustomer(id: string, data: CustomerUpdateRequest): Promise<void> {
        await fetchAPI(`/api/Party/${id}`, {
            method: "PUT",
            body: JSON.stringify({ ...data, partyType: 0 }),
        })
    },

    async deactivateCustomer(id: string): Promise<void> {
        const customer = await this.getCustomerById(id)
        await this.updateCustomer(id, { ...customer, isActive: false })
    },
}
