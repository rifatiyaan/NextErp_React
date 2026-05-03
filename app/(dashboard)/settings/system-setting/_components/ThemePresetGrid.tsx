"use client"

import { Check } from "lucide-react"
import { ACCENT_THEMES, type AccentThemeClass } from "@/lib/ui-settings"
import { cn } from "@/lib/utils"

interface ThemePresetGridProps {
    selected: string | null
    onSelect: (preset: AccentThemeClass) => void
    radiusClass?: string
    disabled?: boolean
}

export function ThemePresetGrid({ selected, onSelect, radiusClass = "rounded-md", disabled }: ThemePresetGridProps) {
    return (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ACCENT_THEMES.map((theme) => {
                const isActive = theme.value === selected
                return (
                    <button
                        key={theme.value}
                        type="button"
                        disabled={disabled}
                        onClick={() => onSelect(theme.value)}
                        className={cn(
                            "group relative flex flex-col items-start gap-2 border p-2.5 text-left transition-colors",
                            radiusClass,
                            "hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            // No shadow / blur on active state — those visually
                            // soften the corners and conflict with a "Sharp"
                            // radius. Use a 2px primary border for a clear,
                            // crisp active signal regardless of corner shape.
                            isActive
                                ? "border-2 border-primary bg-primary/5"
                                : "border border-border bg-background",
                            disabled && "opacity-50 cursor-not-allowed",
                        )}
                    >
                        <div className="flex w-full items-center justify-between">
                            <span
                                className={cn(
                                    // No transform/scale — `scale-105` on hover
                                    // can render past the parent's corner mask
                                    // when sharp is set, producing a "softer"
                                    // edge illusion on bright warm colors.
                                    "size-7 ring-1 ring-border",
                                    radiusClass,
                                    theme.swatch,
                                )}
                                aria-hidden
                            />
                            {isActive && (
                                <span
                                    className={cn(
                                        "flex size-4 items-center justify-center bg-primary text-primary-foreground",
                                        radiusClass,
                                    )}
                                >
                                    <Check className="size-3" strokeWidth={3} />
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-medium">{theme.name}</span>
                    </button>
                )
            })}
        </div>
    )
}
