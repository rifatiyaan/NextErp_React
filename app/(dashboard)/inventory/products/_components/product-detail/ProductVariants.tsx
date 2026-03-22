"use client"

import type { VariationOption } from "@/types/product"
import { sortByDisplayOrder } from "./variant-utils"
import { cn } from "@/lib/utils"

export interface ProductVariantsProps {
    options: VariationOption[]
    selection: Record<number, number>
    onSelectValue: (optionId: number, valueId: number, valueLabel: string) => void
    sectionIndex?: number
}

export function ProductVariants({
    options,
    selection,
    onSelectValue,
    sectionIndex = 2,
}: ProductVariantsProps) {
    const sorted = sortByDisplayOrder(options)
    if (!sorted.length) return null

    return (
        <section className="space-y-2">
            <h3 className="text-xs font-medium text-foreground">
                <span className="text-muted-foreground">{sectionIndex}. </span>
                Variation options
            </h3>
            <div className="space-y-3 rounded-xl border border-border/40 bg-muted/15 p-3 sm:p-3.5">
                {sorted.map((option) => (
                    <div key={option.id} className="space-y-1.5">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            {option.name}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {sortByDisplayOrder(option.values).map((val) => {
                                const selected = selection[option.id] === val.id
                                return (
                                    <button
                                        key={val.id}
                                        type="button"
                                        onClick={() => onSelectValue(option.id, val.id, val.value)}
                                        className={cn(
                                            "rounded-full border px-3 py-1 text-xs font-medium transition-colors sm:text-sm",
                                            selected
                                                ? "border-red-500/80 bg-background text-foreground shadow-sm dark:border-red-500/70"
                                                : "border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground"
                                        )}
                                    >
                                        {val.value}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
