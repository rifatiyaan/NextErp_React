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
