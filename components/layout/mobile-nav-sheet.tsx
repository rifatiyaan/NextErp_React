"use client"

import type { ReactNode } from "react"

import { useSidebar } from "@/components/ui/sidebar"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

export function MobileNavSheet({ children }: { children: ReactNode }) {
    const { isMobile, openMobile, setOpenMobile } = useSidebar()

    if (!isMobile) return null

    return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetContent
                side="left"
                className="w-[min(18rem,100vw)] border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
                aria-describedby={undefined}
            >
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-full max-h-[100dvh] flex-col">{children}</div>
            </SheetContent>
        </Sheet>
    )
}
