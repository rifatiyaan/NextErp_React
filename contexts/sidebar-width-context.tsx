"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SidebarWidthContextType {
    width: string
    setWidth: (width: string) => void
    widthInRem: number
    setWidthInRem: (width: number, options?: { snap?: boolean }) => void
}

const SidebarWidthContext = createContext<SidebarWidthContextType | undefined>(undefined)

export const NAV_RAIL_COLLAPSED_REM = 4
export const NAV_RAIL_THRESHOLD_REM = 7.5
export const NAV_RAIL_MAX_REM = 30

const DEFAULT_WIDTH = NAV_RAIL_COLLAPSED_REM
const MIN_WIDTH = NAV_RAIL_COLLAPSED_REM
const MAX_WIDTH = NAV_RAIL_MAX_REM

export function snapNavRailWidthRem(widthInRem: number): number {
    if (widthInRem < NAV_RAIL_THRESHOLD_REM) return NAV_RAIL_COLLAPSED_REM
    return Math.max(NAV_RAIL_THRESHOLD_REM, Math.min(NAV_RAIL_MAX_REM, widthInRem))
}

export function SidebarWidthProvider({ children }: { children: ReactNode }) {
    const [widthInRem, setWidthInRemState] = useState<number>(DEFAULT_WIDTH)
    const [mounted, setMounted] = useState(false)

    // Load from localStorage after mount to avoid hydration mismatch
    useEffect(() => {
        setMounted(true)
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("sidebarWidth")
            if (saved) {
                const parsed = parseFloat(saved)
                if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
                    setWidthInRemState(parsed)
                }
            }
        }
    }, [])

    // Save to localStorage when width changes (only after mount)
    useEffect(() => {
        if (mounted && typeof window !== "undefined") {
            localStorage.setItem("sidebarWidth", widthInRem.toString())
        }
    }, [widthInRem, mounted])

    const setWidthInRem = (width: number, options?: { snap?: boolean }) => {
        const next = options?.snap ? snapNavRailWidthRem(width) : Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width))
        setWidthInRemState(next)
    }

    const width = `${widthInRem}rem`
    const setWidth = (width: string) => {
        const remValue = parseFloat(width.replace("rem", ""))
        if (!isNaN(remValue)) {
            setWidthInRem(remValue)
        }
    }

    // Use default width during SSR and initial render to prevent hydration mismatch
    const safeWidth = mounted ? width : `${DEFAULT_WIDTH}rem`
    const safeWidthInRem = mounted ? widthInRem : DEFAULT_WIDTH

    return (
        <SidebarWidthContext.Provider value={{ width: safeWidth, setWidth, widthInRem: safeWidthInRem, setWidthInRem }}>
            {children}
        </SidebarWidthContext.Provider>
    )
}

export function useSidebarWidth() {
    const context = useContext(SidebarWidthContext)
    if (context === undefined) {
        throw new Error("useSidebarWidth must be used within a SidebarWidthProvider")
    }
    return context
}

