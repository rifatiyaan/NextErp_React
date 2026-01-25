"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SidebarWidthContextType {
    width: string
    setWidth: (width: string) => void
    widthInRem: number
    setWidthInRem: (width: number) => void
}

const SidebarWidthContext = createContext<SidebarWidthContextType | undefined>(undefined)

const DEFAULT_WIDTH = 14 // rem
const MIN_WIDTH = 12 // rem
const MAX_WIDTH = 30 // rem

export function SidebarWidthProvider({ children }: { children: ReactNode }) {
    const [widthInRem, setWidthInRemState] = useState<number>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("sidebarWidth")
            if (saved) {
                const parsed = parseFloat(saved)
                if (!isNaN(parsed) && parsed >= MIN_WIDTH && parsed <= MAX_WIDTH) {
                    return parsed
                }
            }
        }
        return DEFAULT_WIDTH
    })

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("sidebarWidth", widthInRem.toString())
        }
    }, [widthInRem])

    const setWidthInRem = (width: number) => {
        const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width))
        setWidthInRemState(clampedWidth)
    }

    const width = `${widthInRem}rem`
    const setWidth = (width: string) => {
        const remValue = parseFloat(width.replace("rem", ""))
        if (!isNaN(remValue)) {
            setWidthInRem(remValue)
        }
    }

    return (
        <SidebarWidthContext.Provider value={{ width, setWidth, widthInRem, setWidthInRem }}>
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

