// Types matching your .NET Module entity

export enum ModuleType {
    Module = 1,
    Link = 2,
}

export interface ModuleMetadata {
    // From metadata object in JSON
    roles?: string[]
    badgeText?: string
    badgeColor?: string
    description?: string
    openInNewTab?: boolean
    author?: string
    website?: string
    dependencies?: string[]
    configurationUrl?: string
}

export interface Module {
    id: number
    title: string
    icon?: string
    url?: string
    parentId?: number | null
    parent?: Module
    children: Module[]
    type: ModuleType
    description?: string | null
    version?: string | null
    isInstalled: boolean
    isEnabled: boolean
    installedAt?: string | null
    order: number
    isActive: boolean
    isExternal: boolean
    createdAt?: string
    updatedAt?: string | null
    tenantId?: string
    branchId?: string
    metadata?: ModuleMetadata
}

// Simplified type for menu rendering
export interface MenuItem {
    id: number
    title: string
    icon?: string
    url?: string
    parentId?: number | null
    children: MenuItem[]
    type: ModuleType
    order: number
    isExternal: boolean
    badgeText?: string
    openInNewTab?: boolean
}

