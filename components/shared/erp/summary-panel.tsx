import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Sticky summary card with elevation — mirrors primary workspace styling. */
export function SummaryPanel({
    className,
    children,
}: {
    className?: string
    children: ReactNode
}) {
    return (
        <aside
            className={cn(
                "sticky top-3 flex min-h-[min(100vh-1.5rem,52rem)] w-full max-w-full flex-col gap-4 rounded-none border border-border/80 bg-card p-4 shadow-md ring-1 ring-border/40 lg:max-w-[340px]",
                className
            )}
        >
            {children}
        </aside>
    )
}
