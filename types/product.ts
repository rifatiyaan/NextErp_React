import { Category } from "@/types/category"

export interface ProductMetadata {
    description?: string | null
    color?: string | null
    warranty?: string | null
    categoryId?: number | null
}

export interface VariationOption {
    id: number
    name: string
    displayOrder: number
    values: VariationValue[]
}

export interface VariationValue {
    id: number
    value: string
    displayOrder: number
}

export interface ProductVariant {
    id: number
    sku: string
    price: number
    availableQuantity?: number
    isActive: boolean
    title: string
    variationValues: VariationValue[]
}

export interface ProductImageItem {
    id: number
    url: string
    displayOrder: number
    isThumbnail: boolean
}

export interface Product {
    id: number
    title: string
    code: string
    price: number
    totalAvailableQuantity?: number | null
    hasLowStock?: boolean | null
    categoryId: number
    createdAt?: string | null
    imageUrl?: string | null
    images?: ProductImageItem[] | null
    metadata?: ProductMetadata
    category?: Category | null
    isActive: boolean
    hasVariations?: boolean
    variationOptions?: VariationOption[]
    productVariants?: ProductVariant[]
    unitOfMeasureId?: number
    unitAbbreviation?: string
    unitTitle?: string
}

export interface ProductListResponse {
    total: number
    totalDisplay: number
    data: Product[]
}

export interface ProductImageSlotPayload {
    url?: string
    file?: File
    isThumbnail: boolean
}

export interface ProductImageThumbnailUpdatePayload {
    id: number
    isThumbnail: boolean
}

export interface CreateProductRequest {
    title: string
    code: string
    price: number
    initialStock?: number
    categoryId: number
    imageUrl?: File | string | null
    imageSlots?: ProductImageSlotPayload[]
    productImageThumbnailUpdates?: ProductImageThumbnailUpdatePayload[]
    clearGallery?: boolean
    metadata?: ProductMetadata
    isActive: boolean
    parentId?: number
    unitOfMeasureId?: number
}
