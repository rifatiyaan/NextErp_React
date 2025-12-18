export interface Category {
    id: number
    title: string
    description?: string | null
    metadata?: any
    isActive: boolean
    parentId?: number | null
    parent?: Category | null
    children?: Category[]
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
    isActive: boolean
    parentId?: number | null
}
