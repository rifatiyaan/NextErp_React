import { fetchAPI } from "@/lib/api/client"
import type { SalesReport } from "@/lib/types/reports"
import type {
    CreateSaleRequest,
    PagedSaleListResponse,
    SaleDetail,
    SaleListRow,
} from "@/lib/types/sale"

export type { CreateSaleRequest, SaleDetail, PagedSaleListResponse, SaleListRow } from "@/lib/types/sale"

function normalizeSaleListRow(raw: Record<string, unknown>): SaleListRow {
    return {
        id: String(raw.id ?? raw.Id ?? ""),
        saleNumber: String(raw.saleNumber ?? raw.SaleNumber ?? ""),
        customerName: String(raw.customerName ?? raw.CustomerName ?? ""),
        saleDate: String(raw.saleDate ?? raw.SaleDate ?? ""),
        finalAmount: Number(raw.finalAmount ?? raw.FinalAmount ?? 0),
        totalPaid: Number(raw.totalPaid ?? raw.TotalPaid ?? 0),
        balanceDue: Number(raw.balanceDue ?? raw.BalanceDue ?? 0),
    }
}

export const saleAPI = {
    async createSale(data: CreateSaleRequest): Promise<SaleDetail> {
        return fetchAPI<SaleDetail>("/api/Sale", {
            method: "POST",
            body: JSON.stringify(data),
        })
    },

    async getSaleById(id: string): Promise<SaleDetail> {
        return fetchAPI<SaleDetail>(`/api/Sale/${id}`)
    },

    async getSales(
        pageIndex: number = 1,
        pageSize: number = 10,
        searchText?: string,
        sortBy?: string
    ): Promise<PagedSaleListResponse> {
        const params = new URLSearchParams({
            page: pageIndex.toString(),
            pageSize: pageSize.toString(),
        })
        if (searchText) params.append("searchText", searchText)
        if (sortBy) params.append("sortBy", sortBy)

        const raw = await fetchAPI<Record<string, unknown>>(`/api/Sale?${params.toString()}`)
        const dataRaw = raw?.data ?? raw?.Data
        const rows = Array.isArray(dataRaw)
            ? (dataRaw as Record<string, unknown>[]).map(normalizeSaleListRow)
            : []
        return {
            total: Number(raw?.total ?? raw?.Total ?? 0),
            totalDisplay: Number(
                raw?.totalDisplay ?? raw?.TotalDisplay ?? raw?.total ?? raw?.Total ?? 0
            ),
            page: Number(raw?.page ?? raw?.Page ?? pageIndex),
            pageSize: Number(raw?.pageSize ?? raw?.PageSize ?? pageSize),
            data: rows,
        }
    },

    async getSalesReport(
        startDate: string,
        endDate: string,
        customerId?: string | null
    ) {
        const params = new URLSearchParams({
            startDate,
            endDate,
        })
        if (customerId) params.append("customerId", customerId)
        return fetchAPI<SalesReport>(`/api/Sale/report?${params.toString()}`)
    },
}
