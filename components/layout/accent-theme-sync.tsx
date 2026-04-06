"use client"

import { useEffect } from "react"

import { ACCENT_THEME_CLASSNAMES, useUiSettingsStore } from "@/lib/ui-settings"

export function AccentThemeSync() {
    const accentTheme = useUiSettingsStore((s) => s.accentTheme)

    useEffect(() => {
        const body = document.body
        ACCENT_THEME_CLASSNAMES.forEach((c) => body.classList.remove(c))
        body.classList.add(accentTheme)
    }, [accentTheme])

    return null
}
