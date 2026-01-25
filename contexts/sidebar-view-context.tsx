"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

type SidebarViewMode = "grid" | "sidebar"

interface SidebarViewContextType {
    mode: SidebarViewMode
    toggleMode: () => void
    setMode: (mode: SidebarViewMode) => void
}

const SidebarViewContext = createContext<SidebarViewContextType | undefined>(undefined)

const STORAGE_KEY = "sidebar-view-mode"

export function SidebarViewProvider({ children }: { children: ReactNode }) {
    const [mode, setModeState] = useState<SidebarViewMode>("grid")

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as SidebarViewMode | null
        if (saved === "grid" || saved === "sidebar") {
            setModeState(saved)
        }
    }, [])

    // Save to localStorage when mode changes
    const setMode = (newMode: SidebarViewMode) => {
        setModeState(newMode)
        localStorage.setItem(STORAGE_KEY, newMode)
    }

    const toggleMode = () => {
        setMode(mode === "grid" ? "sidebar" : "grid")
    }

    return (
        <SidebarViewContext.Provider value={{ mode, toggleMode, setMode }}>
            {children}
        </SidebarViewContext.Provider>
    )
}

export function useSidebarView() {
    const context = useContext(SidebarViewContext)
    if (context === undefined) {
        throw new Error("useSidebarView must be used within a SidebarViewProvider")
    }
    return context
}

