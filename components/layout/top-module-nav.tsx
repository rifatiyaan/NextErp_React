"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useMemo } from "react"

import type { MenuItem } from "@/types/module"
import { useMenu } from "@/contexts/menu-context"
import { useSidebarView } from "@/contexts/sidebar-view-context"
import { ModuleType, coerceModuleType } from "@/types/module"
import { useRadiusClass } from "@/hooks/use-radius-class"

import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DynamicIcon } from "@/components/dynamic-icon"
import { cn } from "@/lib/utils"

function normalizePath(path: string) {
    if (path === "/" || path === "") return "/"
    return path.replace(/\/+$/, "")
}

export function TopModuleNav({
    className,
    variant = "compact",
}: {
    className?: string
    variant?: "compact" | "root"
}) {
    const pathname = usePathname()
    const { menuTree, isLoading } = useMenu()
    const { mode } = useSidebarView()
    const radiusClass = useRadiusClass()

    const isRoot = variant === "root"
    const rootMotion = "transition-[width,gap,padding,min-width,background-color] duration-500 ease-in-out"
    const compactMotion =
        "transition-[width,gap,padding,min-width,background-color] duration-200 ease-in-out"
    const triggerBase = cn(
        "flex shrink-0 items-center rounded-md border border-transparent font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
        isRoot ? cn(rootMotion, "h-11 min-h-11 max-w-[min(18rem,calc(100vw-4rem))] overflow-hidden text-sm sm:h-12 sm:min-h-12") : cn(compactMotion, "h-8 max-w-[10rem] overflow-hidden text-xs")
    )
    const labelMotionRoot = "transition-[opacity,max-width] duration-500 ease-in-out"
    const labelMotionCompact = "transition-[opacity,max-width] duration-200 ease-in-out"
    const iconWrap = isRoot ? "h-5 w-5 shrink-0" : "h-4 w-4 shrink-0"
    const iconOnlyW = isRoot ? "w-11 min-w-11 justify-center px-0 sm:w-12 sm:min-w-12" : "w-8 min-w-8 justify-center px-0"
    const hoverExpand = isRoot
        ? "hover:w-[min(12rem,calc(100vw-2rem))] hover:justify-start hover:gap-2.5 hover:px-3"
        : "hover:w-[min(10rem,calc(100vw-12rem))] hover:justify-start hover:gap-2 hover:px-2"
    const selectedExpandedRoot = cn(
        "w-auto min-w-0 justify-start gap-2.5 overflow-visible px-3 sm:gap-2.5 sm:px-3",
        "max-w-[min(18rem,calc(100vw-4rem))]"
    )
    const selectedW = isRoot
        ? selectedExpandedRoot
        : "w-[min(10rem,calc(100vw-12rem))] justify-start gap-2 overflow-hidden px-2"

    const selectedModuleRoot = cn(
        "border-transparent bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/25",
        "hover:bg-primary/90 hover:text-primary-foreground",
        "focus-visible:ring-2 focus-visible:ring-primary-foreground/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    )

    const menuItems = useMemo(() => {
        const filtered = menuTree
            .filter((m) => coerceModuleType(m.type) === ModuleType.Module)
            .sort((a, b) => a.order - b.order)
        if (mode === "grid") {
            return filtered.map((m) => ({ ...m, children: [] as MenuItem[] }))
        }
        return filtered
    }, [menuTree, mode])

    const renderLeafLink = (item: MenuItem) => {
        const href = item.url || "#"
        const isActive =
            href === "/" ? pathname === href : pathname === href || pathname.startsWith(href + "/")
        const target = item.openInNewTab ? "_blank" : undefined
        const rel = item.isExternal ? "noopener noreferrer" : undefined

        const rootSelected = isRoot && isActive

        return (
            <Link
                href={href}
                target={target}
                rel={rel}
                className={cn(
                    triggerBase,
                    rootSelected
                        ? cn(selectedModuleRoot, selectedExpandedRoot, "[&_svg]:text-primary-foreground")
                        : cn(iconOnlyW, "gap-0", "hover:bg-muted/50", hoverExpand),
                    isActive && !isRoot && cn("bg-muted/80 text-foreground", selectedW)
                )}
                title={item.title}
            >
                {item.icon ? (
                    <DynamicIcon name={item.icon as never} className={iconWrap} />
                ) : null}
                <span
                    className={cn(
                        rootSelected
                            ? "min-w-0 flex-1 truncate text-left opacity-100"
                            : cn(
                                  "min-w-0 truncate opacity-0 max-w-0 overflow-hidden",
                                  isRoot ? labelMotionRoot : labelMotionCompact,
                                  "group-hover:opacity-100",
                                  isRoot ? "group-hover:max-w-[12rem]" : "group-hover:max-w-[10rem]",
                                  isActive && "max-w-[10rem] opacity-100"
                              )
                    )}
                >
                    {item.title}
                </span>
            </Link>
        )
    }

    return (
        <nav
            className={cn(
                "flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
                isRoot ? "py-0.5 sm:gap-1.5" : "gap-0.5 py-0.5",
                className
            )}
            aria-label="Modules"
        >
            {isLoading ? (
                <span className="px-2 text-xs text-muted-foreground">…</span>
            ) : (
                menuItems.map((item) => {
                    const hasChildren = item.children && item.children.length > 0
                    const href = item.url || "#"
                    const isActive =
                        href === "/"
                            ? pathname === href
                            : pathname === href || pathname.startsWith(href + "/")
                    const normalizedPathname = normalizePath(pathname)
                    const hasActiveChild =
                        hasChildren &&
                        item.children.some((child) => {
                            const ch = normalizePath(child.url || "#")
                            return ch !== "#" && normalizedPathname === ch
                        })

                    const showParentLabel = isActive || hasActiveChild
                    const rootParentSelected = isRoot && showParentLabel

                    if (mode === "sidebar" && hasChildren) {
                        return (
                            <DropdownMenu key={item.id} modal={false}>
                                <DropdownMenuTrigger
                                    className={cn(
                                        triggerBase,
                                        "group/trigger",
                                        rootParentSelected
                                            ? cn(
                                                  selectedModuleRoot,
                                                  selectedExpandedRoot,
                                                  "[&_svg]:text-primary-foreground",
                                                  "data-[state=open]:bg-primary/90 data-[state=open]:text-primary-foreground"
                                              )
                                            : cn(
                                                  iconOnlyW,
                                                  "gap-0",
                                                  "hover:bg-muted/50",
                                                  hoverExpand,
                                                  "data-[state=open]:justify-start data-[state=open]:gap-2 data-[state=open]:px-2",
                                                  isRoot &&
                                                      "data-[state=open]:gap-2.5 data-[state=open]:px-3 data-[state=open]:sm:gap-2.5",
                                                  "data-[state=open]:bg-muted/65"
                                              ),
                                        showParentLabel && !isRoot && cn("bg-muted/80", selectedW)
                                    )}
                                >
                                    {item.icon ? (
                                        <DynamicIcon name={item.icon as never} className={iconWrap} />
                                    ) : null}
                                    <span
                                        className={cn(
                                            rootParentSelected
                                                ? "min-w-0 flex-1 truncate text-left opacity-100"
                                                : cn(
                                                      "min-w-0 truncate overflow-hidden",
                                                      isRoot ? labelMotionRoot : labelMotionCompact,
                                                      showParentLabel &&
                                                          !isRoot &&
                                                          "max-w-[10rem] opacity-100",
                                                      !showParentLabel &&
                                                          cn(
                                                              "max-w-0 opacity-0",
                                                              isRoot
                                                                  ? "group-hover/trigger:max-w-[12rem] group-data-[state=open]/trigger:max-w-[12rem]"
                                                                  : "group-hover/trigger:max-w-[10rem] group-data-[state=open]/trigger:max-w-[10rem]",
                                                              "group-hover/trigger:opacity-100 group-data-[state=open]/trigger:opacity-100"
                                                          )
                                                  )
                                        )}
                                    >
                                        {item.title}
                                    </span>
                                    {item.badgeText ? (
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "ms-auto h-5 shrink-0 px-1 text-[10px] transition-[opacity,max-width]",
                                                isRoot ? "duration-500 ease-in-out" : "duration-200 ease-in-out",
                                                rootParentSelected &&
                                                    "border-primary-foreground/35 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20",
                                                showParentLabel
                                                    ? "opacity-100"
                                                    : "max-w-0 overflow-hidden opacity-0 group-hover/trigger:max-w-[4rem] group-hover/trigger:opacity-100 group-data-[state=open]/trigger:max-w-[4rem] group-data-[state=open]/trigger:opacity-100"
                                            )}
                                        >
                                            {item.badgeText}
                                        </Badge>
                                    ) : null}
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="start"
                                    side="bottom"
                                    sideOffset={6}
                                    className={cn("min-w-[10rem] p-1", radiusClass)}
                                >
                                    {item.url ? (
                                        <>
                                            <DropdownMenuItem asChild className="h-8 text-xs">
                                                <Link href={item.url}>Overview</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="my-0.5" />
                                        </>
                                    ) : null}
                                    {item.children.map((child) => {
                                        const childHref = child.url || "#"
                                        const ch = normalizePath(childHref)
                                        const childIsActive =
                                            ch !== "#" && normalizedPathname === ch
                                        const ct = child.openInNewTab ? "_blank" : undefined
                                        const cr = child.isExternal ? "noopener noreferrer" : undefined
                                        return (
                                            <DropdownMenuItem
                                                key={child.id}
                                                asChild
                                                className={cn(
                                                    "h-8 text-xs",
                                                    childIsActive && "bg-muted font-medium"
                                                )}
                                            >
                                                <Link href={childHref} target={ct} rel={cr}>
                                                    {child.icon ? (
                                                        <DynamicIcon
                                                            name={child.icon as never}
                                                            className="mr-2 h-3.5 w-3.5"
                                                        />
                                                    ) : null}
                                                    {child.title}
                                                </Link>
                                            </DropdownMenuItem>
                                        )
                                    })}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )
                    }

                    return (
                        <div key={item.id} className="group flex shrink-0">
                            {renderLeafLink(item)}
                        </div>
                    )
                })
            )}
        </nav>
    )
}
