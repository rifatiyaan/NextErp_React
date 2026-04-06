import type { Module } from "@/types/module"
import { ModuleType, coerceModuleType } from "@/types/module"

export type MenuPermissionItem = { key: string; label: string }

export function menuPermissionKey(moduleId: number): string {
    return `menu:${moduleId}`
}

export function buildPermissionGroupsFromMenu(modules: Module[]): Record<string, MenuPermissionItem[]> {
    const roots = [...modules].sort((a, b) => a.order - b.order)
    const groups: Record<string, MenuPermissionItem[]> = {}

    for (const root of roots) {
        if (coerceModuleType(root.type) !== ModuleType.Module) continue

        const childLinks = (root.children ?? [])
            .filter((c) => coerceModuleType(c.type) === ModuleType.Link)
            .sort((a, b) => a.order - b.order)
            .map((c) => ({
                key: menuPermissionKey(c.id),
                label: c.title,
            }))

        if (childLinks.length > 0) {
            groups[root.title] = childLinks
            continue
        }

        if (root.url?.trim()) {
            groups[root.title] = [
                {
                    key: menuPermissionKey(root.id),
                    label: root.title,
                },
            ]
        }
    }

    return groups
}

export function flattenMenuPermissionKeys(groups: Record<string, MenuPermissionItem[]>): Set<string> {
    return new Set(
        Object.values(groups)
            .flat()
            .map((i) => i.key.toLowerCase())
    )
}

export function countRoleMenuPermissions(
    rolePermissionKeys: string[],
    menuKeys: Set<string>
): number {
    const role = new Set(rolePermissionKeys.map((k) => k.toLowerCase()))
    let n = 0
    for (const k of menuKeys) {
        if (role.has(k)) n++
    }
    return n
}
