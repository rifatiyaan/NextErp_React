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
    stock: number
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
    stock: number
    /** Aggregated available qty when list was loaded with includeStock */
    totalAvailableQuantity?: number | null
    /** True when any variant is at or below low-stock threshold */
    hasLowStock?: boolean | null
    categoryId: number
    /** ISO date from API when present */
    createdAt?: string | null
    imageUrl?: string | null
    /** Gallery from API when present (ordered). */
    images?: ProductImageItem[] | null
    metadata?: ProductMetadata
    category?: Category | null
    isActive: boolean
    hasVariations?: boolean
    variationOptions?: VariationOption[]
    productVariants?: ProductVariant[]
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
    stock: number
    categoryId: number
    imageUrl?: File | string | null
    /** Multipart: ImageSlots[i].Url / .File / .IsThumbnail */
    imageSlots?: ProductImageSlotPayload[]
    /** Update only: ImageIds + IsThumbnail (no gallery rebuild). */
    productImageThumbnailUpdates?: ProductImageThumbnailUpdatePayload[]
    /** Clears all images on the server (multipart). */
    clearGallery?: boolean
    metadata?: ProductMetadata
    isActive: boolean
    parentId?: number
}
