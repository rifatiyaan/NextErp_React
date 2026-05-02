export interface StockRow {
    id: string
    productVariantId: number
    productId: number
    productTitle: string
    productCode: string
    variantSku: string
    variantTitle: string
    availableQuantity: number
    reorderLevel?: number | null
    unitOfMeasureId?: number | null
    unitOfMeasureAbbreviation?: string | null
    createdAt: string
    updatedAt?: string | null
    tenantId: string
    branchId: string
}

export interface CurrentStockReport {
    stocks: StockRow[]
    totalVariants: number
    totalQuantity: number
}

export interface LowStockItem {
    productVariantId: number
    productId: number
    productTitle: string
    productCode: string
    variantSku: string
    variantTitle: string
    availableQuantity: number
    reorderLevel?: number | null
    unitOfMeasureAbbreviation?: string | null
    status: string
}

export interface LowStockReport {
    items: LowStockItem[]
    totalLowStockVariants: number
}

export type StockAdjustmentMode = "Increase" | "Decrease" | "SetAbsolute"

export interface StockAdjustmentLine {
    id: string
    productVariantId: number
    variantSku: string
    productTitle: string
    quantityChanged: number
    previousQuantity: number
    newQuantity: number
    reasonCode: string
    notes?: string | null
    createdAt: string
}

export interface PagedAdjustmentsResponse {
    items: StockAdjustmentLine[]
    total: number
    pageIndex: number
    pageSize: number
}

export const STOCK_ADJUSTMENT_REASON_LABELS: Record<string, string> = {
    PhysicalCountCorrection: "Physical Count Correction",
    Damaged: "Damaged",
    Expired: "Expired",
    LostOrTheft: "Lost or Theft",
    OpeningBalance: "Opening Balance",
    DataEntryCorrection: "Data Entry Correction",
    Other: "Other",
}
