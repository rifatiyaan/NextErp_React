import type { ComponentProps } from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** Modern dense input: theme tokens, comfortable hit target, soft focus ring. */
export function CompactInput({ className, ...props }: ComponentProps<typeof Input>) {
    return (
        <Input
            className={cn(
                "h-9 rounded-none border-border bg-background px-2.5 text-sm leading-tight shadow-sm transition-[box-shadow,colors] duration-200",
                "placeholder:text-muted-foreground/70",
                "hover:border-border/80",
                "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25",
                className
            )}
            {...props}
        />
    )
}
