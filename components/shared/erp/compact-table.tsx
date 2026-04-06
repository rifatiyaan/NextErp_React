"use client"

import type { ReactNode } from "react"

import { useRadiusClass } from "@/hooks/use-radius-class"
import { cn } from "@/lib/utils"

export function CompactTable({
    className,
    tableClassName,
    children,
}: {
    className?: string
    tableClassName?: string
    children: ReactNode
}) {
    const radiusClass = useRadiusClass()
    return (
        <div
            className={cn(
                "min-w-0 overflow-hidden border border-border/80 bg-card shadow-sm ring-1 ring-border/40",
                radiusClass,
                className
            )}
        >
            <div className="min-w-0 overflow-x-auto">
                <table
                    className={cn(
                        "w-full min-w-[760px] border-collapse text-sm text-foreground",
                        tableClassName
                    )}
                >
                    {children}
                </table>
            </div>
        </div>
    )
}
