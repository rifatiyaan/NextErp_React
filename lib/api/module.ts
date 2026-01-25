import { fetchAPI } from "@/lib/api/client"
import type { Module, MenuItem } from "@/types/module"

export interface CreateModuleRequest {
    title: string
    icon?: string | null
    url?: string | null
    parentId?: number | null
    type: number // 1 = Module, 2 = Link
    description?: string | null
    version?: string | null
    isInstalled?: boolean
    isEnabled?: boolean
    order: number
    isActive?: boolean
    isExternal?: boolean
    metadata?: {
        roles?: string[]
        badgeText?: string | null
        badgeColor?: string | null
        description?: string | null
        openInNewTab?: boolean
        author?: string | null
        website?: string | null
        dependencies?: string[]
        configurationUrl?: string | null
    }
}

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

    /**
     * Get a specific module by ID
     */
    async getModuleById(id: number): Promise<Module> {
        return fetchAPI<Module>(`/api/Module/${id}`)
    },

    /**
     * Create a new module
     */
    async createModule(data: CreateModuleRequest): Promise<Module> {
        return fetchAPI<Module>("/api/Module", {
            method: "POST",
            body: JSON.stringify(data),
        })
    },

    /**
     * Update an existing module
     */
    async updateModule(id: number, data: CreateModuleRequest): Promise<Module> {
        return fetchAPI<Module>(`/api/Module/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        })
    },

    /**
     * Delete a module
     */
    async deleteModule(id: number): Promise<void> {
        return fetchAPI<void>(`/api/Module/${id}`, {
            method: "DELETE",
        })
    },
}

/**
 * Transform backend Module[] to hierarchical menu structure
 */
export function buildMenuTree(modules: Module[]): MenuItem[] {
    // Helper to map a single module to item
    const mapToMenuItem = (m: Module): MenuItem => ({
        id: m.id,
        title: m.title,
        icon: m.icon,
        url: m.url,
        parentId: m.parentId,
        children: m.children ? m.children.sort((a, b) => a.order - b.order).map(mapToMenuItem) : [],
        type: m.type,
        order: m.order,
        isExternal: m.isExternal,
        badgeText: m.metadata?.badgeText,
        openInNewTab: m.metadata?.openInNewTab,
    });

    // 1. Map all input modules
    // If the input is already a Tree (roots only), this effectively finishes the job.
    // If the input is Flat (all items at top level), we need to link them.
    // We'll use a Hybrid approach: logical filtering.

    const allItems = modules.map(mapToMenuItem);

    // Sort by order
    allItems.sort((a, b) => a.order - b.order);

    // Map for quick lookup
    const map = new Map<number, MenuItem>();
    allItems.forEach(item => map.set(item.id, item));

    const roots: MenuItem[] = [];

    // 2. Linkage
    allItems.forEach(item => {
        // If this item is already a child of someone in this list, do we move it?
        // If the API returns a Tree, 'children' are already populated.
        // If the API returns a Flat list, 'children' are empty initially.
        // We only move 'item' into 'parent' IF 'parent' doesn't already have it.

        if (item.parentId && map.has(item.parentId)) {
            const parent = map.get(item.parentId)!;

            // Check if parent already has this child (by ID) to avoid duplication
            // if we received a mix of Flat + Nested data.
            if (!parent.children.some(c => c.id === item.id)) {
                parent.children.push(item);
                // Re-sort children after insertion
                parent.children.sort((a, b) => a.order - b.order);
            }
        } else {
            // It's a root (or parent missing from list)
            roots.push(item);
        }
    });

    return roots;
}
