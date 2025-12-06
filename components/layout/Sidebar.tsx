"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import type { MenuItem } from "@/types/module"
import { moduleAPI, buildMenuTree } from "@/lib/api/module"
import { useAuth } from "@/contexts/auth-context"

import { Badge } from "@/components/ui/badge"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
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
    Sidebar as SidebarWrapper,
    useSidebar,
} from "@/components/ui/sidebar"
import { DynamicIcon } from "@/components/dynamic-icon"
import { CommandMenu } from "./CommandMenu"

export function Sidebar() {
    const pathname = usePathname()
    const { openMobile, setOpenMobile, isMobile } = useSidebar()
    const { user } = useAuth()
    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch menu items when user is authenticated
    useEffect(() => {
        if (user) {
            moduleAPI
                .getUserMenu()
                .then((modules) => {
                    const tree = buildMenuTree(modules)
                    setMenuItems(tree)
                })
                .catch((error) => {
                    console.error("Failed to load menu:", error)
                })
                .finally(() => {
                    setIsLoading(false)
                })
        } else {
            setMenuItems([])
            setIsLoading(false)
        }
    }, [user])

    const renderMenuItem = (item: MenuItem) => {
        const title = item.title
        const badgeText = item.badgeText

        // If the item has children, render it with a collapsible dropdown
        if (item.children && item.children.length > 0) {
            return (
                <Collapsible className="group/collapsible">
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between [&[data-state=open]>svg]:rotate-180">
                            <span className="flex items-center">
                                {item.icon && (
                                    <DynamicIcon name={item.icon} className="me-2 h-4 w-4" />
                                )}
                                <span>{title}</span>
                                {badgeText && (
                                    <Badge variant="secondary" className="me-2">
                                        {badgeText}
                                    </Badge>
                                )}
                            </span>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                        <SidebarMenuSub>
                            {item.children.map((subItem) => (
                                <SidebarMenuItem key={subItem.id}>
                                    {renderMenuItem(subItem)}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            )
        }

        // Otherwise, render the item with a link
        if (item.url) {
            const href = item.url
            const isActive = pathname === href
            const target = item.openInNewTab ? "_blank" : undefined
            const rel = item.isExternal ? "noopener noreferrer" : undefined

            return (
                <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => setOpenMobile(!openMobile)}
                    asChild
                >
                    <Link href={href} target={target} rel={rel}>
                        {item.icon && (
                            <DynamicIcon name={item.icon} className="h-4 w-4" />
                        )}
                        <span>{title}</span>
                        {badgeText && <Badge variant="secondary">{badgeText}</Badge>}
                    </Link>
                </SidebarMenuButton>
            )
        }

        return null
    }

    return (
        <SidebarWrapper side="left">
            <SidebarHeader>
                <Link
                    href="/"
                    className="w-fit flex text-foreground font-black p-2 pb-0 mb-2"
                    onClick={() => isMobile && setOpenMobile(!openMobile)}
                >
                    <span className="text-xl">NextErp_React</span>
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
