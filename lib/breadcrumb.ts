import type { MenuItem } from "@/types/module"

export interface BreadcrumbItem {
    label: string
    href?: string
}

function normalizePath(path: string): string {
    if (path === "" || path === "/") return "/"
    return path.replace(/\/+$/, "")
}

export function getBreadcrumbsFromMenu(
    menuTree: MenuItem[],
    pathname: string
): BreadcrumbItem[] {
    const normalizedPath = normalizePath(pathname)

    function findPath(
        items: MenuItem[],
        pathSoFar: BreadcrumbItem[]
    ): BreadcrumbItem[] | null {
        for (const item of items) {
            const normalizedUrl = item.url ? normalizePath(item.url) : ""
            const fullPath: BreadcrumbItem[] = [
                ...pathSoFar,
                { label: item.title, href: item.url || undefined },
            ]
            const currentMatches =
                normalizedPath === normalizedUrl ||
                (normalizedUrl &&
                    normalizedUrl !== "/" &&
                    (normalizedPath === normalizedUrl ||
                        normalizedPath.startsWith(normalizedUrl + "/")))

            // Prefer deeper match: recurse into children first
            if (item.children?.length) {
                const childPath = findPath(item.children, fullPath)
                if (childPath) return childPath
            }
            if (currentMatches) return fullPath
        }
        return null
    }

    const path = findPath(menuTree, [])
    return path ?? []
}
