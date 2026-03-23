"use client"

import { getRadiusClass } from "@/lib/ui/radius"
import { useUiSettingsStore } from "@/lib/ui-settings/store"

/** Live radius class from persisted UI settings. */
export function useRadiusClass(): string {
    const radius = useUiSettingsStore((s) => s.radius)
    return getRadiusClass(radius)
}
