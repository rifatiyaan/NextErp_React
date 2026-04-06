"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import type { MenuItem } from "@/types/module"
import { useAuth } from "@/contexts/auth-context"
import { hasIdentityAdminRole } from "@/lib/auth/roles"
import { useMenu } from "@/contexts/menu-context"
import { useSidebarView } from "@/contexts/sidebar-view-context"
import { ModuleType, coerceModuleType } from "@/types/module"

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
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DynamicIcon } from "@/components/dynamic-icon"
import { CommandMenu } from "./CommandMenu"
import { cn } from "@/lib/utils"

function stripSettingsFromMenuTree(items: MenuItem[]): MenuItem[] {
    return items
        .filter((item) => {
            const u = item.url || ""
            return !u.startsWith("/settings")
        })
        .map((item) => ({
            ...item,
            children: stripSettingsFromMenuTree(item.children ?? []),
        }))
}

export function DashboardVerticalMenu({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname()
    const { user } = useAuth()
    const allowSettingsNav = hasIdentityAdminRole(user?.roles ?? [])
    const { menuTree, isLoading } = useMenu()
    const { mode } = useSidebarView()
    const { isMobile, setOpenMobile } = useSidebar()
    const [openItems, setOpenItems] = useState<Set<number>>(new Set())

    const close = () => {
        onNavigate?.()
        if (onNavigate === undefined && isMobile) {
            setOpenMobile(false)
        }
    }

    const menuItems = useMemo(() => {
        const base = allowSettingsNav
            ? menuTree
            : stripSettingsFromMenuTree(menuTree)
        const filtered = base
            .filter((m) => coerceModuleType(m.type) === ModuleType.Module)
            .sort((a, b) => a.order - b.order)
        if (mode === "grid") {
            return filtered.map((m) => ({ ...m, children: [] as MenuItem[] }))
        }
        return filtered
    }, [menuTree, mode, allowSettingsNav])

    const CollapsibleItem = ({
        item,
        isActive,
        hasActiveChild,
        defaultOpen,
        badgeText,
        pathname: path,
        openItems: oi,
        setOpenItems: setOi,
    }: {
        item: MenuItem
        isActive: boolean
        hasActiveChild: boolean
        defaultOpen: boolean
        badgeText?: string
        pathname: string
        openItems: Set<number>
        setOpenItems: (updater: (prev: Set<number>) => Set<number>) => void
    }) => {
        const isOpen = oi.has(item.id)

        const handleOpenChange = (open: boolean) => {
            setOi((prev) => {
                const next = new Set(prev)
                if (open) next.add(item.id)
                else next.delete(item.id)
                return next
            })
        }

        useEffect(() => {
            if (defaultOpen && !isOpen) {
                setOi((prev) => {
                    const next = new Set(prev)
                    next.add(item.id)
                    return next
                })
            }
        }, [defaultOpen, item.id, isOpen, setOi])

        return (
            <Collapsible open={isOpen} onOpenChange={handleOpenChange}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        isActive={isActive || hasActiveChild}
                        className={cn(
                            (isActive || hasActiveChild) &&
                                "bg-sidebar-primary text-sidebar-primary-foreground"
                        )}
                    >
                        {item.icon && (
                            <DynamicIcon name={item.icon as never} className="h-4 w-4" />
                        )}
                        <span>{item.title}</span>
                        {badgeText && <Badge variant="secondary">{badgeText}</Badge>}
                        <ChevronDown
                            className={cn(
                                "ml-auto h-4 w-4 transition-transform duration-200",
                                isOpen && "rotate-180"
                            )}
                        />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.children.map((child) => {
                            const childHref = child.url || "#"
                            const normalizePath = (p: string) => {
                                if (p === "/" || p === "") return "/"
                                return p.replace(/\/+$/, "")
                            }
                            const normalizedPathname = normalizePath(path)
                            const normalizedChildHref = normalizePath(childHref)
                            const childIsActive =
                                normalizedPathname === normalizedChildHref &&
                                normalizedChildHref !== "#"
                            const childTarget = child.openInNewTab ? "_blank" : undefined
                            const childRel = child.isExternal ? "noopener noreferrer" : undefined

                            return (
                                <SidebarMenuSubItem key={child.id}>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={childIsActive}
                                        className={cn(
                                            childIsActive &&
                                                "bg-primary/10 font-medium text-primary dark:bg-primary/20 dark:text-foreground"
                                        )}
                                    >
                                        <Link
                                            href={childHref}
                                            target={childTarget}
                                            rel={childRel}
                                            onClick={close}
                                        >
                                            {child.icon && (
                                                <DynamicIcon
                                                    name={child.icon as never}
                                                    className="h-4 w-4"
                                                />
                                            )}
                                            <span>{child.title}</span>
                                            {child.badgeText && (
                                                <Badge variant="secondary">{child.badgeText}</Badge>
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
        const isActive =
            href === "/" ? pathname === href : pathname === href || pathname.startsWith(href + "/")
        const normalizePath = (p: string) => {
            if (p === "/" || p === "") return "/"
            return p.replace(/\/+$/, "")
        }
        const normalizedPathname = normalizePath(pathname)
        const hasActiveChild =
            hasChildren &&
            item.children.some((child) => {
                const childHref = child.url || "#"
                const normalizedChildHref = normalizePath(childHref)
                return normalizedPathname === normalizedChildHref && normalizedChildHref !== "#"
            })
        const defaultOpen = hasActiveChild || isActive

        const target = item.openInNewTab ? "_blank" : undefined
        const rel = item.isExternal ? "noopener noreferrer" : undefined

        if (mode === "sidebar" && hasChildren) {
            return (
                <CollapsibleItem
                    item={item}
                    isActive={isActive}
                    hasActiveChild={hasActiveChild}
                    defaultOpen={defaultOpen}
                    badgeText={badgeText}
                    pathname={pathname}
                    openItems={openItems}
                    setOpenItems={setOpenItems}
                />
            )
        }

        return (
            <SidebarMenuButton isActive={isActive} asChild>
                <Link href={href} target={target} rel={rel} onClick={close}>
                    {item.icon && <DynamicIcon name={item.icon as never} className="h-4 w-4" />}
                    <span>{title}</span>
                    {badgeText && <Badge variant="secondary">{badgeText}</Badge>}
                </Link>
            </SidebarMenuButton>
        )
    }

    return (
        <div className="flex h-full min-h-0 flex-col bg-sidebar text-sidebar-foreground">
            <SidebarHeader className="border-b border-sidebar-border p-3">
                <Link
                    href="/"
                    className="mb-2 block w-fit font-black text-foreground"
                    onClick={close}
                >
                    <span className="text-xl">NextErp</span>
                </Link>
                <CommandMenu buttonClassName="max-w-full" />
            </SidebarHeader>
            <ScrollArea className="min-h-0 flex-1">
                <SidebarContent className="gap-0 p-2">
                    {isLoading ? (
                        <div className="p-4 text-sm text-muted-foreground">Loading menu...</div>
                    ) : menuItems.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground">No menu items available</div>
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
        </div>
    )
}
