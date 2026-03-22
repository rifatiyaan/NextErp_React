import { fetchAPI } from "@/lib/api/client"
import type { CurrentStockReport, LowStockReport } from "@/lib/types/stock"

export const stockAPI = {
    async getCurrentStockReport(): Promise<CurrentStockReport> {
        return fetchAPI<CurrentStockReport>("/api/Stock/report/current")
    },

    async getLowStockReport(): Promise<LowStockReport> {
        return fetchAPI<LowStockReport>("/api/Stock/report/low")
    },
}
