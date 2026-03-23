"use client"

import type { ComponentProps } from "react"

import { useRadiusClass } from "@/hooks/use-radius-class"
import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: ComponentProps<"div">) {
    const radiusClass = useRadiusClass()
    return (
        <div
            data-slot="skeleton"
            className={cn("animate-pulse bg-accent", radiusClass, className)}
            {...props}
        />
    )
}
