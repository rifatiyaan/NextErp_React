"use client"

import { Monitor, Moon, PanelLeft, PanelTop, Settings2, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

import {
    ACCENT_THEMES,
    type AccentThemeClass,
    type UiRadius,
    useUiSettingsStore,
} from "@/lib/ui-settings"
import { useRadiusClass } from "@/hooks/use-radius-class"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

const RADIUS_ORDER: UiRadius[] = ["none", "sm", "md"]

const RADIUS_TOOLTIP: Record<UiRadius, string> = {
    none: "Sharp",
    sm: "Soft",
    md: "Rounded",
}

function RadiusShape({ r, active }: { r: UiRadius; active: boolean }) {
    const shape = {
        none: "rounded-none border-2 border-current",
        sm: "rounded-sm border-2 border-current",
        md: "rounded-md border-2 border-current",
    }[r]
    return (
        <span
            className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center bg-background",
                shape,
                active ? "border-primary text-primary" : "border-muted-foreground/40 text-muted-foreground"
            )}
            aria-hidden
        />
    )
}

export function AppSettingsPanel() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const radiusClass = useRadiusClass()
    const radius = useUiSettingsStore((s) => s.radius)
    const setRadius = useUiSettingsStore((s) => s.setRadius)
    const accentTheme = useUiSettingsStore((s) => s.accentTheme)
    const setAccentTheme = useUiSettingsStore((s) => s.setAccentTheme)
    const navigationPlacement = useUiSettingsStore((s) => s.navigationPlacement)
    const setNavigationPlacement = useUiSettingsStore((s) => s.setNavigationPlacement)

    useEffect(() => setMounted(true), [])

    if (!mounted) {
        return (
            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" disabled aria-label="Settings">
                <Settings2 className="h-4 w-4" />
            </Button>
        )
    }

    const mode = theme === "light" || theme === "dark" || theme === "system" ? theme : "system"

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn("h-8 w-8 shrink-0", radiusClass)}
                    aria-label="App settings"
                >
                    <Settings2 className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className={cn("w-72 p-3", radiusClass)}
                align="end"
                sideOffset={6}
            >
                <div className="flex flex-col gap-2">
                        <p className="text-xs font-medium text-muted-foreground">Modules</p>
                        <div className="flex gap-1">
                            <Button
                                type="button"
                                variant={navigationPlacement === "sidebar" ? "default" : "outline"}
                                size="sm"
                                className={cn("h-8 flex-1 gap-1 px-2 text-xs", radiusClass)}
                                onClick={() => setNavigationPlacement("sidebar")}
                            >
                                <PanelLeft className="h-3.5 w-3.5 shrink-0" />
                                Sidebar
                            </Button>
                            <Button
                                type="button"
                                variant={navigationPlacement === "topbar" ? "default" : "outline"}
                                size="sm"
                                className={cn("h-8 flex-1 gap-1 px-2 text-xs", radiusClass)}
                                onClick={() => setNavigationPlacement("topbar")}
                            >
                                <PanelTop className="h-3.5 w-3.5 shrink-0" />
                                Top bar
                            </Button>
                        </div>
                        <p className="text-[10px] leading-snug text-muted-foreground">
                            Top bar: modules on top; breadcrumb and actions sit on the bottom dock. Grid
                            vs nested items: user profile menu.
                        </p>

                        <Separator className="my-0.5" />

                        <p className="text-xs font-medium text-muted-foreground">Appearance</p>
                        <div className="flex gap-1">
                            <Button
                                type="button"
                                variant={mode === "light" ? "default" : "outline"}
                                size="sm"
                                className={cn("h-8 flex-1 gap-1 px-2 text-xs", radiusClass)}
                                onClick={() => setTheme("light")}
                            >
                                <Sun className="h-3.5 w-3.5" />
                                Light
                            </Button>
                            <Button
                                type="button"
                                variant={mode === "dark" ? "default" : "outline"}
                                size="sm"
                                className={cn("h-8 flex-1 gap-1 px-2 text-xs", radiusClass)}
                                onClick={() => setTheme("dark")}
                            >
                                <Moon className="h-3.5 w-3.5" />
                                Dark
                            </Button>
                            <Button
                                type="button"
                                variant={mode === "system" ? "default" : "outline"}
                                size="sm"
                                className={cn("h-8 flex-1 gap-1 px-2 text-xs", radiusClass)}
                                onClick={() => setTheme("system")}
                            >
                                <Monitor className="h-3.5 w-3.5" />
                                Auto
                            </Button>
                        </div>

                        <Separator className="my-0.5" />

                        <p className="text-xs font-medium text-muted-foreground">Accent</p>
                        <div className="grid grid-cols-6 gap-1">
                            {ACCENT_THEMES.map((t) => (
                                <Button
                                    key={t.value}
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className={cn(
                                        "h-7 w-7 p-0",
                                        radiusClass,
                                        accentTheme === t.value && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                                    )}
                                    onClick={() => setAccentTheme(t.value as AccentThemeClass)}
                                    title={t.name}
                                    aria-label={t.name}
                                >
                                    <span className={cn("h-4 w-4 rounded-full", t.swatch)} />
                                </Button>
                            ))}
                        </div>

                        <Separator className="my-0.5" />

                        <p className="text-xs font-medium text-muted-foreground">Radius</p>
                        <div className="flex gap-1">
                            {RADIUS_ORDER.map((r) => (
                                <Tooltip key={r}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant={radius === r ? "secondary" : "ghost"}
                                            size="sm"
                                            className={cn(
                                                "h-9 flex-1 px-0",
                                                radiusClass,
                                                radius === r && "bg-muted"
                                            )}
                                            onClick={() => setRadius(r)}
                                            aria-label={RADIUS_TOOLTIP[r]}
                                            aria-pressed={radius === r}
                                        >
                                            <RadiusShape r={r} active={radius === r} />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="text-xs">
                                        {RADIUS_TOOLTIP[r]}
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
    )
}
