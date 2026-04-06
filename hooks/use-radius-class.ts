"use client"

import { getRadiusClass } from "@/lib/ui/radius"
import { useUiSettingsStore } from "@/lib/ui-settings/store"

export function useRadiusClass(): string {
    const radius = useUiSettingsStore((s) => s.radius)
    return getRadiusClass(radius)
}
