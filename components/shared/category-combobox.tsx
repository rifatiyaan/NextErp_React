"use client"

import { useMemo } from "react"

import { Combobox } from "@/components/shared/combobox"
import type { Category } from "@/types/category"
import { cn } from "@/lib/utils"

const ALL_VALUE = "__all__"

export type CategoryComboboxProps = {
    categories: Category[]
    value: number | null
    onChange: (categoryId: number | null) => void
    loading?: boolean
    disabled?: boolean
    /** Label for the “all categories” option */
    allLabel?: string
    placeholder?: string
    emptyText?: string
    /** Extra classes on the fixed-width shell (not the dropdown panel). */
    className?: string
    triggerClassName?: string
    size?: "default" | "compact"
}

/**
 * Searchable category filter built on the shared {@link Combobox}.
 * Wrapped in a fixed-width column so the trigger never collapses with a flex sibling search field.
 */
export function CategoryCombobox({
    categories,
    value,
    onChange,
    loading = false,
    disabled = false,
    allLabel = "All categories",
    placeholder,
    emptyText = "No category found.",
    className,
    triggerClassName,
    size = "compact",
}: CategoryComboboxProps) {
    const items = useMemo(
        () => [
            { value: ALL_VALUE, label: allLabel },
            ...categories.map((c) => ({ value: String(c.id), label: c.title })),
        ],
        [categories, allLabel]
    )

    const stringValue = value === null ? ALL_VALUE : String(value)

    return (
        <div className={cn("w-[200px] shrink-0", className)}>
            <Combobox
                items={items}
                value={stringValue}
                onChange={(v) => {
                    if (v == null || v === ALL_VALUE) {
                        onChange(null)
                        return
                    }
                    const id = parseInt(v, 10)
                    onChange(Number.isFinite(id) ? id : null)
                }}
                placeholder={loading ? "Loading…" : (placeholder ?? allLabel)}
                emptyText={emptyText}
                disabled={disabled || loading}
                triggerClassName={cn("w-full", triggerClassName)}
                size={size}
            />
        </div>
    )
}
