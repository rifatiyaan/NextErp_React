import type { SaleDetail } from "@/lib/types/sale"
import type { Purchase } from "@/types/purchase"

export interface SalesReport {
    sales: SaleDetail[]
    totalSalesAmount: number
    totalSales: number
    startDate: string
    endDate: string
}

export interface PurchaseReport {
    purchases: Purchase[]
    totalPurchaseAmount: number
    totalPurchases: number
    startDate: string
    endDate: string
}
