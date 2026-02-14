"use client"

import { ReactNode } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface TopBarAction {
    label: string
    icon?: ReactNode
    onClick: () => void
    variant?: "default" | "outline" | "ghost" | "secondary" | "destructive"
    size?: "default" | "sm" | "lg" | "icon"
}

export interface TopBarProps {
    title: string
    description?: string
    search?: {
        placeholder?: string
        value: string
        onChange: (value: string) => void
        onSearch?: (value: string) => void
    }
    actions?: TopBarAction[]
    filters?: ReactNode
    columnVisibility?: ReactNode
    className?: string
}

export function TopBar({
    title,
    description,
    search,
    actions = [],
    filters,
    columnVisibility,
    className,
}: TopBarProps) {
    return (
        <div
            className={cn(
                "sticky top-0 z-40 w-full",
                "backdrop-blur-md bg-background/80 border-b border-border/50",
                "supports-[backdrop-filter]:bg-background/60",
                className
            )}
        >
            <div className="w-full">
                <div className="flex flex-col gap-3">
                    {/* Title and Actions Row */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                            {description && (
                                <p className="text-sm text-muted-foreground mt-1">{description}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            {actions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant={action.variant || "default"}
                                    size={action.size || "sm"}
                                    onClick={action.onClick}
                                    className="h-8"
                                >
                                    {action.icon && <span className="mr-1.5">{action.icon}</span>}
                                    {action.label}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Search and Filters Row */}
                    {(search || filters || columnVisibility) && (
                        <div className="flex items-center gap-2 flex-wrap">
                            {search && (
                                <div className="relative flex-1 min-w-[200px] max-w-md">
                                    <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                    <Input
                                        placeholder={search.placeholder || "Search..."}
                                        value={search.value}
                                        onChange={(e) => search.onChange(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && search.onSearch) {
                                                search.onSearch(search.value)
                                            }
                                        }}
                                        className="pl-8 h-8 text-sm bg-background/50 border-border/50"
                                    />
                                </div>
                            )}

                            {filters && (
                                <div className="flex items-center gap-2">
                                    {filters}
                                </div>
                            )}

                            {columnVisibility && (
                                <div className="flex items-center gap-2 ml-auto">
                                    {columnVisibility}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

