"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

import type { ReactNode } from "react"
import { MenuProvider } from "@/contexts/menu-context"
import { useSidebar } from "@/components/ui/sidebar"
import { useUiSettingsStore } from "@/lib/ui-settings"
import { MobileNavSheet } from "@/components/layout/mobile-nav-sheet"
import { DashboardVerticalMenu } from "@/components/layout/dashboard-vertical-menu"
import { Sidebar } from "@/components/layout/Sidebar"
import { Header } from "@/components/layout/Header"
import { TopbarModuleStrip } from "@/components/layout/topbar-module-strip"
import { DashboardBottomBar } from "@/components/layout/dashboard-bottom-bar"
import { en } from "@/data/dictionaries/en"

function TopbarMobileNav() {
    const { setOpenMobile } = useSidebar()
    return (
        <MobileNavSheet>
            <DashboardVerticalMenu onNavigate={() => setOpenMobile(false)} />
        </MobileNavSheet>
    )
}

export function MainLayout({ children }: { children: ReactNode }) {
    const { user, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()
    const dictionary = en

    useEffect(() => {
        if (!isLoading && !user) {
            router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`)
        }
    }, [user, isLoading, router, pathname])

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Loading application...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <MenuProvider>
            <MainLayoutShell dictionary={dictionary}>{children}</MainLayoutShell>
        </MenuProvider>
    )
}

function MainLayoutShell({
    children,
    dictionary,
}: {
    children: ReactNode
    dictionary: typeof en
}) {
    const navigationPlacement = useUiSettingsStore((s) => s.navigationPlacement)

    return (
        <div className="flex h-full min-h-screen w-full min-w-0 bg-background text-foreground">
            {navigationPlacement === "topbar" ? (
                <>
                    <TopbarMobileNav />
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
                        <TopbarModuleStrip />
                        <main className="min-h-0 flex-1 overflow-y-auto bg-background p-2 sm:p-3 lg:p-4">
                            {children}
                        </main>
                        <DashboardBottomBar dictionary={dictionary} />
                    </div>
                </>
            ) : (
                <>
                    <Sidebar />
                    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
                        <Header dictionary={dictionary} />
                        <main className="min-h-0 flex-1 overflow-y-auto bg-background p-2 sm:p-3 lg:p-4">
                            {children}
                        </main>
                    </div>
                </>
            )}
        </div>
    )
}
