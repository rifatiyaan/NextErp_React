import { Category } from "@/types/category"

export interface ProductMetadata {
    description?: string | null
    color?: string | null
    warranty?: string | null
    categoryId?: number | null
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
    imageUrl?: string
    metadata?: ProductMetadata
    isActive: boolean
    parentId?: number
}
