export interface PurchaseItem {
    id?: string
    title: string
    productId: number
    productTitle?: string
    quantity: number
    unitCost: number
    total?: number
}

export interface Purchase {
    id: string
    title: string
    purchaseNumber: string
    supplierId: number
    supplierName: string
    purchaseDate: string
    totalAmount: number
    items: PurchaseItem[]
    metadata?: {
        referenceNo?: string
        notes?: string
    }
    isActive: boolean
    createdAt: string
    updatedAt?: string
    tenantId: string
    branchId?: string
}

export interface CreatePurchaseRequest {
    title: string
    purchaseNumber: string
    supplierId: number
    purchaseDate: string
    discount: number
    items: PurchaseItemRequest[]
    metadata?: {
        batchNo?: string
        billNo?: string
        challanNo?: string
        referenceNo?: string
        notes?: string
    }
}

export interface PurchaseItemMetadata {
    description?: string
    weight?: number
    expiryDate?: string
    batchNumber?: string
}

export interface PurchaseItemRequest {
    title: string
    productId: number
    quantity: number
    unitCost: number
    metadata?: PurchaseItemMetadata
}

export interface PurchaseListResponse {
    total: number
    totalDisplay: number
    data: Purchase[]
}

