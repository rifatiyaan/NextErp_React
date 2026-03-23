"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { DynamicBreadcrumb } from "@/components/layout/DynamicBreadcrumb"
import { NotificationDropdown } from "./NotificationDropdown"
import { UserDropdown } from "./UserDropdown"
import { ToggleMobileSidebar } from "./ToggleMobileSidebar"
import { ModeDropdown } from "./ModeDropdown"
import { ThemeCustomizer } from "./ThemeCustomizer"
import { UiSettingsMenu } from "@/components/ui-settings/ui-settings-menu"
import type { DictionaryType } from "@/lib/get-dictionary"

export function Header({
    dictionary,
}: {
    dictionary: DictionaryType
}) {
    return (
        <header className="sticky top-0 z-50 w-full bg-background border-b border-sidebar-border">
            <div className="container flex h-12 items-center gap-2 sm:gap-3">
                <ToggleMobileSidebar />
                <SidebarTrigger className="hidden shrink-0 lg:flex" />
                <div className="min-w-0 flex-1">
                    <DynamicBreadcrumb variant="header" />
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <NotificationDropdown dictionary={dictionary} />
                    <ThemeCustomizer />
                    <UiSettingsMenu />
                    <ModeDropdown dictionary={dictionary} />
                    {/* <LanguageDropdown dictionary={dictionary} /> */}
                    <UserDropdown dictionary={dictionary} />
                </div>
            </div>
        </header>
    )
}
