"use client"

import { DynamicBreadcrumb } from "@/components/layout/DynamicBreadcrumb"
import { AppSettingsPanel } from "@/components/layout/app-settings-panel"
import { NotificationDropdown } from "./NotificationDropdown"
import { UserDropdown } from "./UserDropdown"
import { ToggleMobileSidebar } from "./ToggleMobileSidebar"
import type { DictionaryType } from "@/lib/get-dictionary"

/** Topbar layout: context + utilities docked to the bottom (below page content). */
export function DashboardBottomBar({ dictionary }: { dictionary: DictionaryType }) {
    return (
        <div
            className="sticky bottom-0 z-40 flex h-12 w-full min-w-0 shrink-0 items-center gap-1.5 border-t border-sidebar-border bg-background/95 px-2 backdrop-blur-md supports-[backdrop-filter]:bg-background/85 sm:gap-2 sm:px-3"
            style={{ paddingBottom: "max(0.25rem, env(safe-area-inset-bottom))" }}
        >
            <ToggleMobileSidebar />
            <div className="min-w-0 flex-1">
                <DynamicBreadcrumb variant="dock" />
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                <NotificationDropdown dictionary={dictionary} />
                <AppSettingsPanel />
                <UserDropdown dictionary={dictionary} />
            </div>
        </div>
    )
}
