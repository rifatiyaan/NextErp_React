"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"

import type {
    NavigationNestedItem,
    NavigationRootItem,
} from "@/types"

import { navigationsData } from "@/data/navigations"

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

    // Simplified layout check - assuming vertical only for now, or handled by parent
    // If we wanted horizontal support, we'd check a context/setting here.

    const renderMenuItem = (item: NavigationRootItem | NavigationNestedItem) => {
        const title = item.title
        const label = item.label

        // If the item has nested items, render it with a collapsible dropdown.
        if (item.items) {
            return (
                <Collapsible className="group/collapsible">
                    <CollapsibleTrigger asChild>
                        <SidebarMenuButton className="w-full justify-between [&[data-state=open]>svg]:rotate-180">
                            <span className="flex items-center">
                                {"iconName" in item && (
                                    <DynamicIcon name={item.iconName} className="me-2 h-4 w-4" />
                                )}
                                <span>{title}</span>
                                {"label" in item && (
                                    <Badge variant="secondary" className="me-2">
                                        {label}
                                    </Badge>
                                )}
                            </span>
                            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                        </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                        <SidebarMenuSub>
                            {item.items.map((subItem: NavigationNestedItem) => (
                                <SidebarMenuItem key={subItem.title}>
                                    {renderMenuItem(subItem)}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </Collapsible>
            )
        }

        // Otherwise, render the item with a link.
        if ("href" in item) {
            const href = item.href
            const isActive = pathname === href

            return (
                <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => setOpenMobile(!openMobile)}
                    asChild
                >
                    <Link href={href}>
                        {"iconName" in item && (
                            <DynamicIcon name={item.iconName} className="h-4 w-4" />
                        )}
                        <span>{title}</span>
                        {"label" in item && <Badge variant="secondary">{label}</Badge>}
                    </Link>
                </SidebarMenuButton>
            )
        }
    }

    return (
        <SidebarWrapper side="left">
            <SidebarHeader>
                <Link
                    href="/"
                    className="w-fit flex text-foreground font-black p-2 pb-0 mb-2"
                    onClick={() => isMobile && setOpenMobile(!openMobile)}
                >
                    {/* 
            Replacing Shadboard logo with text or placeholder. 
            Shadboard used /images/icons/shadboard.svg.
            We can add an Image here if we have one, or just text.
           */}
                    <span className="text-xl">NextGenERP</span>
                </Link>
                <CommandMenu buttonClassName="max-w-full" />
            </SidebarHeader>
            <ScrollArea>
                <SidebarContent className="gap-0">
                    {navigationsData.map((nav) => {
                        const title = nav.title

                        return (
                            <SidebarGroup key={nav.title}>
                                <SidebarGroupLabel>{title}</SidebarGroupLabel>
                                <SidebarGroupContent>
                                    <SidebarMenu>
                                        {nav.items.map((item) => (
                                            <SidebarMenuItem key={item.title}>
                                                {renderMenuItem(item)}
                                            </SidebarMenuItem>
                                        ))}
                                    </SidebarMenu>
                                </SidebarGroupContent>
                            </SidebarGroup>
                        )
                    })}
                </SidebarContent>
            </ScrollArea>
        </SidebarWrapper>
    )
}
