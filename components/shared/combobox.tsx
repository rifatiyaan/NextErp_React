"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type ComboboxItem = { value: string; label: string }

export type ComboboxProps = {
    items: ComboboxItem[]
    value: string | null
    onChange: (value: string | null) => void
    placeholder?: string
    emptyText?: string
    disabled?: boolean
    className?: string
    triggerClassName?: string
    /** `compact` uses h-8 trigger and denser command input (toolbar row). */
    size?: "default" | "compact"
}

export function Combobox({
    items,
    value,
    onChange,
    placeholder = "Select…",
    emptyText = "No match.",
    disabled = false,
    className,
    triggerClassName,
    size = "default",
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)
    const selected = items.find((i) => i.value === value)
    const compact = size === "compact"

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between border-border bg-background px-2.5 font-normal text-foreground",
                        compact ? "h-8" : "h-9",
                        !selected && "text-muted-foreground",
                        triggerClassName
                    )}
                >
                    <span className="truncate">{selected?.label ?? placeholder}</span>
                    <ChevronsUpDown className="ms-2 h-4 w-4 shrink-0 opacity-50" aria-hidden />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn("w-[var(--radix-popover-trigger-width)] border-border p-0", className)}
                align="start"
            >
                <Command>
                    <CommandInput
                        placeholder="Search…"
                        className={cn("border-border", compact ? "h-8 py-2" : "h-9")}
                    />
                    <CommandList>
                        <CommandEmpty className="py-3 text-sm text-muted-foreground">
                            {emptyText}
                        </CommandEmpty>
                        <CommandGroup>
                            {items.map((item) => (
                                <CommandItem
                                    key={item.value}
                                    value={item.label}
                                    onSelect={() => {
                                        onChange(item.value === value ? null : item.value)
                                        setOpen(false)
                                    }}
                                    className="text-sm"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4 shrink-0",
                                            value === item.value ? "opacity-100" : "opacity-0"
                                        )}
                                        aria-hidden
                                    />
                                    <span className="truncate">{item.label}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
