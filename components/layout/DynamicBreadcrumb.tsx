"use client"

import { usePathname } from "next/navigation"
import { useMenuOptional } from "@/contexts/menu-context"
import { PageBreadcrumb } from "@/components/layout/PageBreadcrumb"

export function DynamicBreadcrumb({
    variant = "page",
}: {
    variant?: "page" | "header"
} = {}) {
    const pathname = usePathname()
    const menu = useMenuOptional()

    if (!menu) return null

    const items = menu.getBreadcrumbs(pathname)
    if (!items.length) return null

    return <PageBreadcrumb items={items} variant={variant} />
}
