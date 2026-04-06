import { create } from "zustand"
import { persist } from "zustand/middleware"

import type { AccentThemeClass } from "@/lib/ui-settings/accent-themes"
import { DEFAULT_ACCENT_THEME } from "@/lib/ui-settings/accent-themes"

export type UiRadius = "none" | "sm" | "md"

export const UI_RADIUS_CSS: Record<UiRadius, string> = {
    none: "0px",
    sm: "2px",
    md: "0.5rem",
}

export const UI_RADIUS_LABELS: Record<UiRadius, string> = {
    none: "Sharp",
    sm: "Slight",
    md: "Default",
}

export function getRadiusCssValue(radius: UiRadius): string {
    return UI_RADIUS_CSS[radius]
}

export type NavigationPlacement = "sidebar" | "topbar"

export type UiSettingsState = {
    radius: UiRadius
    setRadius: (radius: UiRadius) => void
    accentTheme: AccentThemeClass
    setAccentTheme: (theme: AccentThemeClass) => void
    navigationPlacement: NavigationPlacement
    setNavigationPlacement: (placement: NavigationPlacement) => void
}

export const useUiSettingsStore = create<UiSettingsState>()(
    persist(
        (set) => ({
            radius: "md",
            setRadius: (radius) => set({ radius }),
            accentTheme: DEFAULT_ACCENT_THEME,
            setAccentTheme: (accentTheme) => set({ accentTheme }),
            navigationPlacement: "sidebar",
            setNavigationPlacement: (navigationPlacement) => set({ navigationPlacement }),
        }),
        {
            name: "nexterp-ui-settings",
            partialize: (s) => ({
                radius: s.radius,
                accentTheme: s.accentTheme,
                navigationPlacement: s.navigationPlacement,
            }),
        }
    )
)
