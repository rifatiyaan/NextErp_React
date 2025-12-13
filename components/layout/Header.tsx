"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { NotificationDropdown } from "./NotificationDropdown"
import { UserDropdown } from "./UserDropdown"
import { ToggleMobileSidebar } from "./ToggleMobileSidebar"
import { ModeDropdown } from "./ModeDropdown"
import { ThemeCustomizer } from "./ThemeCustomizer"
import type { DictionaryType } from "@/lib/get-dictionary"

export function Header({
    dictionary,
}: {
    dictionary: DictionaryType
}) {
    return (
        <header className="sticky top-0 z-50 w-full bg-background border-b border-sidebar-border">
            <div className="container flex h-14 justify-between items-center gap-4">
                <ToggleMobileSidebar />
                <div className="grow flex justify-end gap-2">
                    <SidebarTrigger className="hidden lg:flex lg:me-auto" />
                    <NotificationDropdown dictionary={dictionary} />
                    <ThemeCustomizer />
                    <ModeDropdown dictionary={dictionary} />
                    {/* <LanguageDropdown dictionary={dictionary} /> */}
                    <UserDropdown dictionary={dictionary} />
                </div>
            </div>
        </header>
    )
}
