import { fetchAPI } from "@/lib/api/client"
import type { PurchaseReport } from "@/lib/types/reports"
import type { Purchase, PurchaseListResponse, CreatePurchaseRequest } from "@/types/purchase"

/** Multi-select filters applied with FilterBar (keys match config). */
export type PurchaseListFilters = Record<string, string[]>

function appendPurchaseListFilters(
    params: URLSearchParams,
    filters: PurchaseListFilters | undefined
) {
    if (!filters) return
    const supplier = filters.supplier ?? []
    supplier
        .map((id) => parseInt(id, 10))
        .filter((n) => Number.isInteger(n) && n > 0)
        .forEach((id) => params.append("supplierIds", String(id)))
    ;(filters.status ?? []).forEach((s) => {
        if (s) params.append("status", s)
    })
}

export const purchaseAPI = {
    async getPurchases(
        pageIndex: number = 1,
        pageSize: number = 10,
        searchText?: string,
        sortBy?: string,
        filters?: PurchaseListFilters
    ): Promise<PurchaseListResponse> {
        const params = new URLSearchParams({
            pageIndex: pageIndex.toString(),
            pageSize: pageSize.toString(),
        })
        if (searchText) params.append("searchText", searchText)
        if (sortBy) params.append("sortBy", sortBy)
        appendPurchaseListFilters(params, filters)

        return fetchAPI<PurchaseListResponse>(`/api/Purchase?${params.toString()}`)
    },

    async getPurchaseById(id: string): Promise<Purchase> {
        return fetchAPI<Purchase>(`/api/Purchase/${id}`)
    },

    async createPurchase(data: CreatePurchaseRequest): Promise<Purchase> {
        return fetchAPI<Purchase>("/api/Purchase", {
            method: "POST",
            body: JSON.stringify(data),
        })
    },

    async getReport(
        startDate: string,
        endDate: string,
        supplierId?: number | null
    ): Promise<PurchaseReport> {
        const params = new URLSearchParams({ startDate, endDate })
        if (supplierId != null) params.append("supplierId", String(supplierId))
        return fetchAPI<PurchaseReport>(`/api/Purchase/report?${params.toString()}`)
    },
}

