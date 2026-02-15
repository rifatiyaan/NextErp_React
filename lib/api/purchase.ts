import { fetchAPI } from "@/lib/api/client"
import type { Purchase, PurchaseListResponse, CreatePurchaseRequest } from "@/types/purchase"

export const purchaseAPI = {
    /**
     * Get paginated purchases
     */
    async getPurchases(
        pageIndex: number = 1,
        pageSize: number = 10,
        searchText?: string,
        sortBy?: string
    ): Promise<PurchaseListResponse> {
        const params = new URLSearchParams({
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString(),
        })
        if (searchText) params.append("searchText", searchText)
        if (sortBy) params.append("sortBy", sortBy)

        return fetchAPI<PurchaseListResponse>(`/api/Purchase?${params.toString()}`)
    },

    /**
     * Get single purchase by ID
     */
    async getPurchaseById(id: string): Promise<Purchase> {
        return fetchAPI<Purchase>(`/api/Purchase/${id}`)
    },

    /**
     * Create new purchase
     */
    async createPurchase(data: CreatePurchaseRequest): Promise<Purchase> {
        return fetchAPI<Purchase>("/api/Purchase", {
            method: "POST",
            body: JSON.stringify(data),
        })
    },
}

