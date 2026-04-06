"use client"

import { Sidebar as SidebarWrapper } from "@/components/ui/sidebar"
import { DashboardVerticalMenu } from "@/components/layout/dashboard-vertical-menu"

export function Sidebar() {
    return (
        <SidebarWrapper side="left">
            <DashboardVerticalMenu />
        </SidebarWrapper>
    )
}
