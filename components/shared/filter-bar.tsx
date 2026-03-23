"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRadiusClass } from "@/hooks/use-radius-class"
import { cn } from "@/lib/utils"

export type FilterBarOption = { value: string; label: string }

export type FilterBarFieldConfig = {
    key: string
    label: string
    options: FilterBarOption[]
}

export type FilterBarValues = Record<string, string[]>

function draftFromApplied(
    fields: FilterBarFieldConfig[],
    applied: FilterBarValues
): FilterBarValues {
    const next: FilterBarValues = {}
    for (const f of fields) {
        next[f.key] = applied[f.key] ? [...applied[f.key]] : []
    }
    return next
}

export type FilterBarProps = {
    fields: FilterBarFieldConfig[]
    /** Last applied filters (from parent). Syncs draft when this changes. */
    applied: FilterBarValues
    /** Called only when user clicks Apply with current draft selections. */
    onApply: (values: FilterBarValues) => void
    className?: string
}

export function FilterBar({ fields, applied, onApply, className }: FilterBarProps) {
    const radiusClass = useRadiusClass()
    const [draft, setDraft] = React.useState<FilterBarValues>(() =>
        draftFromApplied(fields, applied)
    )

    React.useEffect(() => {
        setDraft(draftFromApplied(fields, applied))
    }, [fields, applied])

    const toggle = React.useCallback((key: string, optionValue: string, checked: boolean) => {
        setDraft((prev) => {
            const cur = new Set(prev[key] ?? [])
            if (checked) cur.add(optionValue)
            else cur.delete(optionValue)
            return { ...prev, [key]: [...cur] }
        })
    }, [])

    const handleApply = React.useCallback(() => {
        onApply(draftFromApplied(fields, draft))
    }, [draft, fields, onApply])

    const summary = React.useCallback(
        (key: string) => {
            const sel = draft[key] ?? []
            if (sel.length === 0) return "Any"
            if (sel.length === 1) {
                const opt = fields.find((f) => f.key === key)?.options.find((o) => o.value === sel[0])
                return opt?.label ?? sel[0]
            }
            return `${sel.length} selected`
        },
        [draft, fields]
    )

    if (fields.length === 0) return null

    return (
        <div
            className={cn(
                "flex h-8 w-full items-stretch overflow-hidden border border-border bg-muted/50 text-foreground",
                radiusClass,
                className
            )}
        >
            {fields.map((field, index) => (
                <DropdownMenu key={field.key} modal={false}>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            className={cn(
                                "inline-flex h-8 min-w-0 max-w-[200px] flex-1 items-center justify-between gap-1 border-border bg-transparent px-2.5 text-left text-[12px] font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-1 focus-visible:ring-ring",
                                index > 0 && "border-l border-border"
                            )}
                        >
                            <span className="truncate">
                                {field.label}
                                <span className="ms-1 font-normal text-muted-foreground">
                                    ({summary(field.key)})
                                </span>
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className={cn(
                            "max-h-64 min-w-[12rem] border-border bg-popover p-1 text-popover-foreground",
                            radiusClass
                        )}
                    >
                        {field.options.map((opt) => (
                            <DropdownMenuCheckboxItem
                                key={opt.value}
                                checked={(draft[field.key] ?? []).includes(opt.value)}
                                onCheckedChange={(c) => toggle(field.key, opt.value, Boolean(c))}
                                onSelect={(e) => e.preventDefault()}
                                className="text-[12px]"
                            >
                                {opt.label}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            ))}
            <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-8 shrink-0 border-0 border-l border-border px-3 text-[12px] font-medium"
                onClick={handleApply}
            >
                Apply
            </Button>
        </div>
    )
}
