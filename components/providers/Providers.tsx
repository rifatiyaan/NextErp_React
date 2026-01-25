"use client"

import type { ReactNode } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarViewProvider } from "@/contexts/sidebar-view-context"
import { SidebarWidthProvider } from "@/contexts/sidebar-width-context"

export function Providers({ children }: { children: ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            themes={[
                "light",
                "dark",
                "theme-zinc",
                "theme-slate",
                "theme-stone",
                "theme-gray",
                "theme-neutral",
                "theme-red",
                "theme-rose",
                "theme-orange",
                "theme-green",
                "theme-blue",
                "theme-yellow",
                "theme-violet"
            ]}
        >
            <SidebarWidthProvider>
                <SidebarProvider>
                    <SidebarViewProvider>
                        {children}
                    </SidebarViewProvider>
                </SidebarProvider>
            </SidebarWidthProvider>
        </NextThemesProvider>
    )
}
