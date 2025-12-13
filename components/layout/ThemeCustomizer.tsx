"use client"

import * as React from "react"
import { Paintbrush } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const themes = [
    { name: "Zinc", value: "theme-zinc", color: "bg-zinc-950" },
    { name: "Slate", value: "theme-slate", color: "bg-slate-950" },
    { name: "Stone", value: "theme-stone", color: "bg-stone-950" },
    { name: "Gray", value: "theme-gray", color: "bg-gray-950" },
    { name: "Neutral", value: "theme-neutral", color: "bg-neutral-950" },
    { name: "Red", value: "theme-red", color: "bg-red-600" },
    { name: "Rose", value: "theme-rose", color: "bg-rose-600" },
    { name: "Orange", value: "theme-orange", color: "bg-orange-500" },
    { name: "Green", value: "theme-green", color: "bg-green-600" },
    { name: "Blue", value: "theme-blue", color: "bg-blue-600" },
    { name: "Yellow", value: "theme-yellow", color: "bg-yellow-500" },
    { name: "Violet", value: "theme-violet", color: "bg-violet-600" },
]

export function ThemeCustomizer() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    // Effective theme logic handles if "system" or specific mode is selected
    // Note: The color theme approach in themes.css is class-based (e.g., .theme-red).
    // next-themes normally toggles light/dark class.
    // If we want color themes, we need to toggle the body class.
    // However, basic next-themes toggles the 'class' attribute on HTML.
    // For color themes AND dark mode to coexist, we usually set the color theme on the body and dark/light on HTML.
    // OR we compose them.
    // The previous implementation (Providers.tsx) manually added "theme-zinc".
    // Let's assume we manage the color theme separately in a body class via useEffect here?
    // OR we use the next-themes "themes" but that switches ONLY one value.
    // Wait, themes.css has `.theme-zinc { ... vars ... @variant dark { ... } }`.
    // This means `theme-zinc` handles BOTH light and dark provided the `.dark` class is present (or `theme-zinc.dark`?).
    // No, nesting: `.theme-zinc .dark` or `.theme-zinc.dark`?
    // In themes.css: `.theme-zinc { ... @variant dark { ... } }`. Tailwincss v4 syntax is different?
    // The provided file looks like v3 standard CSS or v4.
    // `@variant dark` implies it compiles to `.dark .theme-zinc` or `.theme-zinc.dark`.
    // Valid strategy: 
    // 1. `next-themes` handles "light"/"dark" on HTML.
    // 2. We handle "theme-zinc" class on BODY manually.

    // Let's store the color theme in local storage or just state for now.
    const [colorTheme, setColorTheme] = React.useState("theme-zinc")

    React.useEffect(() => {
        // Remove old theme names from body
        themes.forEach(t => document.body.classList.remove(t.value))
        // Add new
        document.body.classList.add(colorTheme)
    }, [colorTheme])

    if (!mounted) return null

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                    <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
                    <span className="sr-only">Customize theme</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Color Theme</h4>
                        <p className="text-sm text-muted-foreground">
                            Pick a color theme for the dashboard.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {themes.map((t) => (
                            <Button
                                key={t.value}
                                variant={"outline"}
                                className={cn(
                                    "justify-start",
                                    colorTheme === t.value && "border-2 border-primary"
                                )}
                                onClick={() => setColorTheme(t.value)}
                            >
                                <span
                                    className={cn(
                                        "mr-2 flex h-5 w-5 shrink-0 -translate-x-1 items-center justify-center rounded-full",
                                        t.color
                                    )}
                                />
                                {t.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
