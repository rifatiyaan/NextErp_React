import { fetchAPI } from "@/lib/api/client"
import type {
    CurrentStockReport,
    LowStockReport,
    PagedAdjustmentsResponse,
} from "@/lib/types/stock"

export const stockAPI = {
    async getCurrentStockReport(signal?: AbortSignal): Promise<CurrentStockReport> {
        return fetchAPI<CurrentStockReport>("/api/Stock/report/current", { signal })
    },

    async getLowStockReport(signal?: AbortSignal): Promise<LowStockReport> {
        return fetchAPI<LowStockReport>("/api/Stock/report/low", { signal })
    },

    async setReorderLevel(productVariantId: number, reorderLevel: number | null): Promise<void> {
        return fetchAPI<void>(`/api/Stock/variant/${productVariantId}/reorder-level`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reorderLevel),
        })
    },

    async adjustStock(payload: {
        productVariantId: number
        mode: "Increase" | "Decrease" | "SetAbsolute"
        quantity: number
        reasonCode: string
        notes?: string | null
    }): Promise<{ id: string }> {
        return fetchAPI<{ id: string }>("/api/Stock/adjust", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
    },

    async getAdjustmentHistory(
        params: { productVariantId?: number; pageIndex?: number; pageSize?: number } = {},
        signal?: AbortSignal
    ): Promise<PagedAdjustmentsResponse> {
        const q = new URLSearchParams()
        if (params.productVariantId != null) q.append("productVariantId", String(params.productVariantId))
        q.append("pageIndex", String(params.pageIndex ?? 1))
        q.append("pageSize", String(params.pageSize ?? 20))
        return fetchAPI<PagedAdjustmentsResponse>(`/api/Stock/adjustments?${q.toString()}`, { signal })
    },

    async getAdjustmentReasons(signal?: AbortSignal): Promise<string[]> {
        return fetchAPI<string[]>("/api/Stock/adjustment-reasons", { signal })
    },
}
