"use client"

import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import type { VariantProps } from "class-variance-authority"
import type { ComponentProps } from "react"

import { useRadiusClass } from "@/hooks/use-radius-class"
import { cn } from "@/lib/utils"

export const badgeVariants = cva(
    "inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground",
                secondary: "border-transparent bg-secondary text-secondary-foreground",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground",
                outline: "text-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

type BadgeProps = ComponentProps<"span"> &
    VariantProps<typeof badgeVariants> & {
        asChild?: boolean
    }

export function Badge({
    className,
    variant,
    asChild = false,
    ...props
}: BadgeProps) {
    const Comp = asChild ? Slot : "span"
    const radiusClass = useRadiusClass()

    return (
        <Comp
            data-slot="badge"
            className={cn(badgeVariants({ variant }), radiusClass, className)}
            {...props}
        />
    )
}
