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

export interface Product {
    id: number
    title: string
    code: string
    price: number
    stock: number
    categoryId: number
    imageUrl?: string | null
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

export interface CreateProductRequest {
    title: string
    code: string
    price: number
    stock: number
    categoryId: number
    imageUrl?: File | string | null
    metadata?: ProductMetadata
    isActive: boolean
    parentId?: number
}
