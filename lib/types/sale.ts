export interface SaleMetadata {
    referenceNo?: string | null
    paymentMethod?: string | null
    notes?: string | null
}

export interface SaleItemResponse {
    id: string
    title: string
    productVariantId: number
    productTitle: string
    variantSku: string
    variantTitle: string
    quantity: number
    unitPrice: number
    total: number
}

export interface SalePaymentLine {
    id: string
    saleId: string
    amount: number
    paymentMethod: string | number
    paidAt: string
    reference?: string | null
    createdAt: string
}

/** Full sale shape returned by list and detail APIs */
export interface SaleDetail {
    id: string
    title: string
    saleNumber: string
    customerId: string
    customerName: string
    saleDate: string
    totalAmount: number
    discount: number
    tax: number
    finalAmount: number
    totalPaid: number
    balanceDue: number
    items: SaleItemResponse[]
    payments: SalePaymentLine[]
    metadata: SaleMetadata
    isActive: boolean
    createdAt: string
    updatedAt?: string | null
    tenantId: string
    branchId?: string | null
}

/** Paged list row from GET /api/Sale (lightweight projection). */
export interface SaleListRow {
    id: string
    saleNumber: string
    customerName: string
    saleDate: string
    finalAmount: number
    totalPaid: number
    balanceDue: number
}

export interface PagedSaleListResponse {
    total: number
    totalDisplay: number
    page: number
    pageSize: number
    data: SaleListRow[]
}

export interface SaleItemRequest {
    productVariantId: number
    quantity: number
    price: number
    subtotal: number
}

export interface CreateSaleRequest {
    customerId?: string | null
    totalAmount: number
    discount: number
    tax: number
    finalAmount: number
    paymentMethod?: string
    paidAmount?: number
    items: SaleItemRequest[]
    /** Optional cashier / internal note (sent if API supports it). */
    notes?: string | null
}
