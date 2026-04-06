export interface Supplier {
    id: string
    title: string
    contactPerson?: string
    phone?: string
    email?: string
    address?: string
    vatNumber?: string
    taxId?: string
    notes?: string
    partyType?: number
    isActive: boolean
    createdAt: string
    updatedAt?: string
    tenantId: string
    branchId?: string
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
