"use client"

import { useEffect } from "react"
import type { ReactNode } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"

// Simple ThemeProvider to set default theme
function ThemeProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        document.body.classList.add("theme-zinc")
        document.documentElement.classList.add("light") // Default to light
    }, [])
    return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ThemeProvider>
            <SidebarProvider>
                {children}
            </SidebarProvider>
        </ThemeProvider>
    )
}
