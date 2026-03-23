"use client"

import { Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useRadiusClass } from "@/hooks/use-radius-class"
import { UI_RADIUS_LABELS, useUiSettingsStore, type UiRadius } from "@/lib/ui-settings"
import { cn } from "@/lib/utils"

const RADIUS_OPTIONS: UiRadius[] = ["none", "sm", "md"]

export function UiSettingsMenu() {
    const radiusClass = useRadiusClass()
    const radius = useUiSettingsStore((s) => s.radius)
    const setRadius = useUiSettingsStore((s) => s.setRadius)

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className={cn("h-8 w-8 shrink-0", radiusClass)}
                    aria-label="Interface settings"
                >
                    <Settings2 className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className={cn("w-72 p-4", radiusClass)} align="end">
                <div className="space-y-3">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Interface</h3>
                        <p className="text-xs text-muted-foreground">
                            Corner radius for buttons, fields, cards, and panels.
                        </p>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-medium text-muted-foreground">
                            Corner radius
                        </Label>
                        <div className="flex flex-col gap-1.5">
                            {RADIUS_OPTIONS.map((key) => (
                                <Button
                                    key={key}
                                    type="button"
                                    variant={radius === key ? "default" : "outline"}
                                    size="sm"
                                    className={cn(
                                        "h-8 w-full justify-start text-xs font-normal",
                                        radiusClass
                                    )}
                                    onClick={() => setRadius(key)}
                                >
                                    {UI_RADIUS_LABELS[key]}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
