import { fetchAPI } from "@/lib/api/client"
import type { CurrentStockReport, LowStockReport } from "@/lib/types/stock"

export const stockAPI = {
    async getCurrentStockReport(): Promise<CurrentStockReport> {
        return fetchAPI<CurrentStockReport>("/api/Stock/report/current")
    },

    async getLowStockReport(): Promise<LowStockReport> {
        return fetchAPI<LowStockReport>("/api/Stock/report/low")
    },

    async setReorderLevel(productVariantId: number, reorderLevel: number | null): Promise<void> {
        return fetchAPI<void>(`/api/Stock/variant/${productVariantId}/reorder-level`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(reorderLevel),
        })
    },
}
