// Types matching your .NET Module entity

export enum ModuleType {
    Module = 1,
    Link = 2,
}

export interface ModuleMetadata {
    // From MenuItem
    roles?: string[]
    badgeText?: string
    badgeColor?: string
    description?: string
    openInNewTab?: boolean
    // From Module
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
    parentId?: number
    parent?: Module
    children: Module[]
    type: ModuleType
    description?: string
    version?: string
    isInstalled: boolean
    isEnabled: boolean
    installedAt?: string
    order: number
    isActive: boolean
    isExternal: boolean
    createdAt: string
    updatedAt?: string
    tenantId: string
    branchId?: string
    metadata: ModuleMetadata
}

// Simplified type for menu rendering
export interface MenuItem {
    id: number
    title: string
    icon?: string
    url?: string
    parentId?: number
    children: MenuItem[]
    type: ModuleType
    order: number
    isExternal: boolean
    badgeText?: string
    openInNewTab?: boolean
}
