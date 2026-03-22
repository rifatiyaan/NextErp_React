"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ProductHeaderProps {
    title: string
    sku: string
    categoryLabel: string
    priceFormatted: string
    inStock: boolean
    editHref: string
}

export function ProductHeader({
    title,
    sku,
    categoryLabel,
    priceFormatted,
    inStock,
    editHref,
}: ProductHeaderProps) {
    return (
        <div className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                        {title}
                    </h2>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                        <span className="whitespace-nowrap">SKU: {sku}</span>
                        <span className="mx-2 text-border" aria-hidden>
                            •
                        </span>
                        <span className="whitespace-nowrap">Category: {categoryLabel}</span>
                    </p>
                </div>
                <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 rounded-full border-border/60 bg-background/50 text-xs"
                >
                    <Link href={editHref}>
                        <Edit className="mr-2 h-3.5 w-3.5" />
                        Edit
                    </Link>
                </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
                <span className="text-2xl font-semibold tracking-tight text-foreground">
                    {priceFormatted}
                </span>
                <span
                    className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium sm:text-xs",
                        inStock
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-red-600/90 text-white dark:bg-red-600"
                    )}
                >
                    {inStock ? "In Stock" : "Out of Stock"}
                </span>
            </div>
        </div>
    )
}
