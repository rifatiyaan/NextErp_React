export interface UnitOfMeasure {
    id: number
    name: string
    title?: string
    abbreviation: string
    category?: string | null
    isSystem?: boolean
    isActive: boolean
}
