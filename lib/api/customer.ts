import { fetchAPI } from "./client"

export interface Customer {
    id: string
    title: string
    email?: string
    phone?: string
    address?: string
    isActive: boolean
    createdAt: string
    updatedAt?: string
    tenantId: string
    branchId?: string
    metadata?: {
        loyaltyCode?: string
        notes?: string
        nationalId?: string
    }
}

export interface CustomerCreateRequest {
    title: string
    email?: string
    phone?: string
    address?: string
    isActive?: boolean
    metadata?: {
        loyaltyCode?: string
        notes?: string
        nationalId?: string
    }
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
        sortBy?: string
    ): Promise<CustomerListResponse> {
        const params = new URLSearchParams({
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString(),
        })
        if (searchText) params.append("searchText", searchText)
        if (sortBy) params.append("sortBy", sortBy)

        const response = await fetchAPI<CustomerListResponse>(
            `/api/Customer?${params.toString()}`
        )
        return response
    },

    async getCustomerById(id: string): Promise<Customer> {
        const response = await fetchAPI<Customer>(`/api/Customer/${id}`)
        return response
    },

    async createCustomer(data: CustomerCreateRequest): Promise<Customer> {
        const response = await fetchAPI<Customer>("/api/Customer", {
            method: "POST",
            body: JSON.stringify(data),
        })
        return response
    },

    async updateCustomer(
        id: string,
        data: CustomerUpdateRequest
    ): Promise<void> {
        await fetchAPI(`/api/Customer/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    },

    async deleteCustomer(id: string): Promise<void> {
        await fetchAPI(`/api/Customer/${id}`, {
            method: "DELETE",
        })
    },
}

