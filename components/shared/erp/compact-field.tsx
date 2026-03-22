import type { ReactNode } from "react"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function CompactField({
    label,
    htmlFor,
    className,
    children,
}: {
    label: string
    htmlFor?: string
    className?: string
    children: ReactNode
}) {
    return (
        <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
            <Label
                htmlFor={htmlFor}
                className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
                {label}
            </Label>
            {children}
        </div>
    )
}
