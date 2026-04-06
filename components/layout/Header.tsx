"use client"

import { DynamicBreadcrumb } from "@/components/layout/DynamicBreadcrumb"
import { AppSettingsPanel } from "@/components/layout/app-settings-panel"
import { NotificationDropdown } from "./NotificationDropdown"
import { UserDropdown } from "./UserDropdown"
import { ToggleMobileSidebar } from "./ToggleMobileSidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import type { DictionaryType } from "@/lib/get-dictionary"

export function Header({
    dictionary,
}: {
    dictionary: DictionaryType
}) {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-sidebar-border bg-background">
            <div className="flex h-11 w-full min-w-0 items-center gap-1.5 px-2 sm:gap-2 sm:px-3">
                <ToggleMobileSidebar />
                <SidebarTrigger className="hidden shrink-0 lg:flex" />
                <div className="min-w-0 flex-1">
                    <DynamicBreadcrumb variant="header" />
                </div>
                <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                    <NotificationDropdown dictionary={dictionary} />
                    <AppSettingsPanel />
                    <UserDropdown dictionary={dictionary} />
                </div>
            </div>
        </header>
    )
}
