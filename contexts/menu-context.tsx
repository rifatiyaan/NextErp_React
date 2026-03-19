"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react"
import type { MenuItem } from "@/types/module"
import { moduleAPI, buildMenuTree } from "@/lib/api/module"
import { getBreadcrumbsFromMenu, type BreadcrumbItem } from "@/lib/breadcrumb"
import { useAuth } from "@/contexts/auth-context"

interface MenuContextValue {
    menuTree: MenuItem[]
    isLoading: boolean
    getBreadcrumbs: (pathname: string) => BreadcrumbItem[]
}

const MenuContext = createContext<MenuContextValue | null>(null)

export function MenuProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [menuTree, setMenuTree] = useState<MenuItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            setMenuTree([])
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        moduleAPI
            .getUserMenu()
            .then((modules) => {
                const tree = buildMenuTree(modules)
                setMenuTree(tree)
            })
            .catch((error) => {
                console.error("Failed to load menu:", error)
                setMenuTree([])
            })
            .finally(() => setIsLoading(false))
    }, [user])

    const getBreadcrumbs = useCallback(
        (pathname: string) => getBreadcrumbsFromMenu(menuTree, pathname),
        [menuTree]
    )

    const value: MenuContextValue = {
        menuTree,
        isLoading,
        getBreadcrumbs,
    }

    return (
        <MenuContext.Provider value={value}>
            {children}
        </MenuContext.Provider>
    )
}

export function useMenu(): MenuContextValue {
    const ctx = useContext(MenuContext)
    if (!ctx) {
        throw new Error("useMenu must be used within MenuProvider")
    }
    return ctx
}

export function useMenuOptional(): MenuContextValue | null {
    return useContext(MenuContext)
}
