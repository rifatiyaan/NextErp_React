import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface EmptyStateProps {
    icon?: LucideIcon
    title: string
    description?: string
    className?: string
    children?: React.ReactNode
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    className,
    children,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center",
                className
            )}
        >
            {Icon ? (
                <div className="mb-3 rounded-full bg-muted p-3">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                </div>
            ) : null}
            <p className="text-sm font-medium">{title}</p>
            {description ? (
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
            ) : null}
            {children ? <div className="mt-4">{children}</div> : null}
        </div>
    )
}
