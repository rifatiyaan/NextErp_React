import { fetchAPI } from "@/lib/api/client"
import type { Module, MenuItem } from "@/types/module"

export const moduleAPI = {
    /**
     * Get menu items for the current authenticated user based on their roles
     */
    async getUserMenu(): Promise<Module[]> {
        return fetchAPI<Module[]>("/api/Module/user-menu")
    },

    /**
     * Get all modules (admin only)
     */
    async getAllModules(tenantId?: string): Promise<Module[]> {
        const params = tenantId ? `?tenantId=${tenantId}` : ""
        return fetchAPI<Module[]>(`/api/Module${params}`)
    },

    /**
     * Get modules by type
     */
    async getModulesByType(type: number, tenantId?: string): Promise<Module[]> {
        const params = tenantId ? `?tenantId=${tenantId}` : ""
        return fetchAPI<Module[]>(`/api/Module/by-type/${type}${params}`)
    },
}

/**
 * Transform backend Module[] to hierarchical menu structure
 */
export function buildMenuTree(modules: Module[]): MenuItem[] {
    // Sort by order
    const sorted = [...modules].sort((a, b) => a.order - b.order)

    // Build hierarchy
    const map = new Map<number, MenuItem>()
    const roots: MenuItem[] = []

    // First pass: create all items
    sorted.forEach((module) => {
        const item: MenuItem = {
            id: module.id,
            title: module.title,
            icon: module.icon,
            url: module.url,
            parentId: module.parentId,
            children: [],
            type: module.type,
            order: module.order,
            isExternal: module.isExternal,
            badgeText: module.metadata?.badgeText,
            openInNewTab: module.metadata?.openInNewTab,
        }
        map.set(module.id, item)
    })

    // Second pass: build tree
    map.forEach((item) => {
        if (item.parentId && map.has(item.parentId)) {
            const parent = map.get(item.parentId)!
            parent.children.push(item)
        } else {
            roots.push(item)
        }
    })

    return roots
}
