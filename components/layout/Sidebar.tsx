"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import type { MenuItem } from "@/types/module"
import { moduleAPI } from "@/lib/api/module"
import { useAuth } from "@/contexts/auth-context"
import { useSidebarView } from "@/contexts/sidebar-view-context"
import { ModuleType } from "@/types/module"

import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    Sidebar as SidebarWrapper,
    useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DynamicIcon } from "@/components/dynamic-icon"
import { CommandMenu } from "./CommandMenu"
import { cn } from "@/lib/utils"

export function Sidebar() {
    const pathname = usePathname()
    const { openMobile, setOpenMobile, isMobile } = useSidebar()
    const { user } = useAuth()
    const { mode } = useSidebarView()
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [openItems, setOpenItems] = useState<Set<number>>(new Set())

    // Fetch menu items when user is authenticated
    useEffect(() => {
        if (user) {
            moduleAPI
                .getUserMenu()
                .then((modules) => {
                    // Convert Module[] to MenuItem[] (the API already returns hierarchical structure)
                    const tree: MenuItem[] = modules.map((m) => ({
                        id: m.id,
                        title: m.title,
                        icon: m.icon,
                        url: m.url,
                        parentId: m.parentId,
                        children: m.children
                            ? m.children
                                  .sort((a, b) => a.order - b.order)
                                  .map((child) => ({
                                      id: child.id,
                                      title: child.title,
                                      icon: child.icon,
                                      url: child.url,
                                      parentId: child.parentId,
                                      children: [],
                                      type: child.type,
                                      order: child.order,
                                      isExternal: child.isExternal,
                                      badgeText: child.metadata?.badgeText,
                                      openInNewTab: child.metadata?.openInNewTab,
                                  }))
                            : [],
                        type: m.type,
                        order: m.order,
                        isExternal: m.isExternal,
                        badgeText: m.metadata?.badgeText,
                        openInNewTab: m.metadata?.openInNewTab,
                    }))
                    
                    if (mode === "grid") {
                        // Grid mode: Only show parent modules (type = 1, Module) in the sidebar
                        // Children will be displayed on the module's page
                        const parentModules = tree
                            .filter((m) => m.type === ModuleType.Module)
                            .map((m) => ({
                                ...m,
                                children: [], // Don't render children in sidebar
                            }))
                            .sort((a, b) => a.order - b.order)
                        
                        setMenuItems(parentModules)
                    } else {
                        // Sidebar mode: Show all modules with children in collapsible format
                        setMenuItems(tree.sort((a, b) => a.order - b.order))
                    }
                })
                .catch((error) => {
                    console.error("Failed to load menu:", error)
                    // Set empty menu items on error to prevent infinite loading
                    setMenuItems([])
                    // Show user-friendly error message
                    if (error.message?.includes("Network error") || error.message?.includes("Failed to fetch")) {
                        console.warn("⚠️ API connection failed. Please ensure:")
                        console.warn("1. Backend is running on https://localhost:7245")
                        console.warn("2. You have accepted the SSL certificate (visit https://localhost:7245/index.html first)")
                        console.warn("3. CORS is properly configured")
                    }
                })
                .finally(() => {
                    setIsLoading(false)
                })
        } else {
            setMenuItems([])
            setIsLoading(false)
        }
    }, [user, mode])

    // Component for collapsible menu items with children
    const CollapsibleItem = ({
        item,
        isActive,
        hasActiveChild,
        defaultOpen,
        badgeText,
        target,
        rel,
        setOpenMobile,
        pathname,
        openItems,
        setOpenItems,
    }: {
        item: MenuItem
        isActive: boolean
        hasActiveChild: boolean
        defaultOpen: boolean
        badgeText?: string
        target?: string
        rel?: string
        setOpenMobile: (open: boolean) => void
        pathname: string
        openItems: Set<number>
        setOpenItems: (updater: (prev: Set<number>) => Set<number>) => void
    }) => {
        const isOpen = openItems.has(item.id)

        const handleOpenChange = (open: boolean) => {
            setOpenItems((prev) => {
                const newSet = new Set(prev)
                if (open) {
                    // Add this item (independent behavior - multiple can be open)
                    newSet.add(item.id)
                } else {
                    // Remove this item
                    newSet.delete(item.id)
                }
                return newSet
            })
        }

        // Initialize with defaultOpen if it's true (for active items)
        useEffect(() => {
            if (defaultOpen && !isOpen) {
                setOpenItems((prev) => {
                    const newSet = new Set(prev)
                    // Add this item without closing others
                    newSet.add(item.id)
                    return newSet
                })
            }
        }, [defaultOpen, item.id, isOpen, setOpenItems])

        return (
            <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        isActive={isActive || hasActiveChild}
                        onClick={() => setOpenMobile(!openMobile)}
                        className={cn(
                            (isActive || hasActiveChild) && "bg-sidebar-primary text-sidebar-primary-foreground"
                        )}
                    >
                        {item.icon && (
                            <DynamicIcon name={item.icon as any} className="h-4 w-4" />
                        )}
                        <span>{item.title}</span>
                        {badgeText && <Badge variant="secondary">{badgeText}</Badge>}
                        <ChevronDown
                            className={`ml-auto h-4 w-4 transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                            }`}
                        />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.children.map((child) => {
                            const childHref = child.url || "#"
                            // Normalize paths: remove trailing slashes (except for root "/")
                            const normalizePath = (path: string) => {
                                if (path === "/" || path === "") return "/"
                                return path.replace(/\/+$/, "")
                            }
                            const normalizedPathname = normalizePath(pathname)
                            const normalizedChildHref = normalizePath(childHref)
                            // Child items should only be active on exact match (strict comparison)
                            const childIsActive = normalizedPathname === normalizedChildHref && normalizedChildHref !== "#"
                            const childTarget = child.openInNewTab ? "_blank" : undefined
                            const childRel = child.isExternal ? "noopener noreferrer" : undefined

                            return (
                                <SidebarMenuSubItem key={child.id}>
                                    <SidebarMenuSubButton 
                                        asChild 
                                        isActive={childIsActive}
                                        className={cn(
                                            childIsActive && "bg-primary/10 dark:bg-primary/20 text-primary dark:text-foreground font-medium"
                                        )}
                                    >
                                        <Link
                                            href={childHref}
                                            target={childTarget}
                                            rel={childRel}
                                            onClick={() => setOpenMobile(!openMobile)}
                                        >
                                            {child.icon && (
                                                <DynamicIcon
                                                    name={child.icon as any}
                                                    className="h-4 w-4"
                                                />
                                            )}
                                            <span>{child.title}</span>
                                            {child.badgeText && (
                                                <Badge variant="secondary">
                                                    {child.badgeText}
                                                </Badge>
                                            )}
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            )
                        })}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        )
    }

    const renderMenuItem = (item: MenuItem) => {
        const title = item.title
        const badgeText = item.badgeText
        const hasChildren = item.children && item.children.length > 0
        const href = item.url || "#"
        // Parent items: active if exact match OR pathname starts with href + "/" (for sub-routes)
        const isActive = href === "/" ? pathname === href : pathname === href || pathname.startsWith(href + "/")
        // Check if any child is active (exact match only)
        const normalizePath = (path: string) => {
            if (path === "/" || path === "") return "/"
            return path.replace(/\/+$/, "")
        }
        const normalizedPathname = normalizePath(pathname)
        const hasActiveChild = hasChildren && item.children.some((child) => {
            const childHref = child.url || "#"
            const normalizedChildHref = normalizePath(childHref)
            return normalizedPathname === normalizedChildHref && normalizedChildHref !== "#"
        })
        // Only expand if active or has active child (accordion behavior - only one open at a time)
        const defaultOpen = hasActiveChild || isActive

        const target = item.openInNewTab ? "_blank" : undefined
        const rel = item.isExternal ? "noopener noreferrer" : undefined

        // In sidebar mode, render with children as collapsible
        if (mode === "sidebar" && hasChildren) {
            return (
                <CollapsibleItem
                    item={item}
                    isActive={isActive}
                    hasActiveChild={hasActiveChild}
                    defaultOpen={defaultOpen}
                    badgeText={badgeText}
                    target={target}
                    rel={rel}
                    setOpenMobile={setOpenMobile}
                    pathname={pathname}
                    openItems={openItems}
                    setOpenItems={setOpenItems}
                />
            )
        }

        // Grid mode or no children: render as simple link
        return (
            <SidebarMenuButton
                isActive={isActive}
                onClick={() => setOpenMobile(!openMobile)}
                asChild
            >
                <Link href={href} target={target} rel={rel}>
                    {item.icon && (
                        <DynamicIcon name={item.icon as any} className="h-4 w-4" />
                    )}
                    <span>{title}</span>
                    {badgeText && <Badge variant="secondary">{badgeText}</Badge>}
                </Link>
            </SidebarMenuButton>
        )
    }

    return (
        <SidebarWrapper side="left">
            <SidebarHeader>
                <Link
                    href="/"
                    className="w-fit flex text-foreground font-black p-2 pb-0 mb-2"
                    onClick={() => isMobile && setOpenMobile(!openMobile)}
                >
                    <span className="text-xl">NextErp</span>
                </Link>
                <CommandMenu buttonClassName="max-w-full" />
            </SidebarHeader>
            <ScrollArea>
                <SidebarContent className="gap-0">
                    {isLoading ? (
                        <div className="p-4 text-sm text-muted-foreground">
                            Loading menu...
                        </div>
                    ) : menuItems.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground">
                            No menu items available
                        </div>
                    ) : (
                        <SidebarGroup>
                            <SidebarGroupLabel>Menu</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {menuItems.map((item) => (
                                        <SidebarMenuItem key={item.id}>
                                            {renderMenuItem(item)}
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    )}
                </SidebarContent>
            </ScrollArea>
        </SidebarWrapper>
    )
}
