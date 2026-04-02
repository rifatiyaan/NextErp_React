export interface BranchMetadata {
    phone?: string
    managerName?: string
    branchCode?: string
    email?: string
}

export interface Branch {
    id: string
    name: string
    address?: string
    isActive: boolean
    createdAt: string
    updatedAt?: string
    metadata?: BranchMetadata
}

export interface BranchCreateRequest {
    name: string
    address?: string
    isActive?: boolean
    metadata?: BranchMetadata
}

export interface BranchUpdateRequest extends BranchCreateRequest {
    id: string
}

export interface BranchListResponse {
    data: Branch[]
    total: number
}
