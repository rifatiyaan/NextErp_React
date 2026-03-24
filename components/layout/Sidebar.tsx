"use client"

import { Sidebar as SidebarWrapper } from "@/components/ui/sidebar"
import { DashboardVerticalMenu } from "@/components/layout/dashboard-vertical-menu"

/** Full left navigation (desktop + mobile sheet via shadcn Sidebar). */
export function Sidebar() {
    return (
        <SidebarWrapper side="left">
            <DashboardVerticalMenu />
        </SidebarWrapper>
    )
}
