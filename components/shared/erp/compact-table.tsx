import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Table in a bordered shell — works in light & dark via theme tokens. */
export function CompactTable({
    className,
    tableClassName,
    children,
}: {
    className?: string
    tableClassName?: string
    children: ReactNode
}) {
    return (
        <div
            className={cn(
                "min-w-0 overflow-x-auto rounded-none border border-border/80 bg-card shadow-sm ring-1 ring-border/40",
                className
            )}
        >
            <table
                className={cn(
                    "w-full min-w-[760px] border-collapse text-sm text-foreground",
                    tableClassName
                )}
            >
                {children}
            </table>
        </div>
    )
}
