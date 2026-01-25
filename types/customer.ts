export interface Customer {
    id: string
    title: string
    email?: string
    phone?: string
    address?: string
    isActive: boolean
    createdAt: string
    updatedAt?: string
    tenantId: string
    branchId?: string
    metadata?: {
        loyaltyCode?: string
        notes?: string
        nationalId?: string
    }
}

export interface CustomerFormValues {
    title: string
    email?: string
    phone?: string
    address?: string
    isActive: boolean
    metadata?: {
        loyaltyCode?: string
        notes?: string
        nationalId?: string
    }
}

