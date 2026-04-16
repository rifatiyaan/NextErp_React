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
