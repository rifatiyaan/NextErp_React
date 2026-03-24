"use client"

import { TopModuleNav } from "@/components/layout/top-module-nav"

/** Topbar layout: primary module row only (root navigation). */
export function TopbarModuleStrip() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-sidebar-border bg-background shadow-sm">
            <div className="flex w-full min-w-0 items-stretch px-2 py-2 sm:px-4 sm:py-2.5">
                <TopModuleNav variant="root" className="w-full min-w-0" />
            </div>
        </header>
    )
}
