export interface Supplier {
    id: number
    title: string
    contactPerson?: string
    phone?: string
    email?: string
    address?: string
    isActive: boolean
    createdAt: string
    updatedAt?: string
    tenantId: string
    branchId?: string
    metadata?: {
        vatNumber?: string
        taxId?: string
        notes?: string
    }
}

export interface SupplierFormValues {
    title: string
    contactPerson?: string
    phone?: string
    email?: string
    address?: string
    isActive: boolean
    metadata?: {
        vatNumber?: string
        taxId?: string
        notes?: string
    }
}

