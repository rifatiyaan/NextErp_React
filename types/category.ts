export interface CategoryAsset {
    filename: string
    url: string
    type?: string
    size?: number | null
    uploadedAt?: string
}

export interface Category {
    id: number
    title: string
    description?: string | null
    metadata?: any
    parentId?: number | null
    parent?: Category | null
    children?: Category[]
    assets?: CategoryAsset[]
}

export interface CategoryListResponse {
    total: number
    totalDisplay: number
    data: Category[]
}

export interface CreateCategoryRequest {
    title: string
    description?: string | null
    metadata?: any
    parentId?: number | null
    images?: File[]
}
