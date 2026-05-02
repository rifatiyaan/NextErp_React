"use client"

import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"

import { systemSettingsQueries } from "@/lib/query/options"
import { useUiSettingsStore, type AccentThemeClass } from "@/lib/ui-settings"
import { useAuth } from "@/contexts/auth-context"

const TENANT_OVERRIDE_STYLE_ID = "tenant-overrides"

/**
 * Applies the per-tenant SystemSettings to the live UI:
 *   1. Toggles the preset accent class on `<body>` (e.g. `theme-blue`)
 *   2. Injects a `<style id="tenant-overrides">` block in `<head>` with any
 *      custom HSL CSS-var overrides
 *   3. Mirrors the result into the existing Zustand `useUiSettingsStore` so
 *      <AccentThemeSync> + <RadiusCssVarSync> + the legacy `AppSettingsPanel`
 *      stay consistent without us reimplementing them
 *
 * Auth-gated: the query is disabled until the user is authenticated, since
 * the API requires a JWT. On logout the override style block is removed and
 * the body class falls back to the Zustand default.
 *
 * Why a side-effect component (renders null) and not a hook?
 *  - Imperative DOM mutation (style tag injection) doesn't fit React's
 *    declarative model cleanly.
 *  - Mounted once at the top of the tree → single source of truth, no
 *    duplicated effects from multiple consumers.
 */
export function SystemSettingsSync() {
    const { user } = useAuth()
    const isAuthenticated = !!user

    const { data: settings } = useQuery({
        ...systemSettingsQueries.current(),
        enabled: isAuthenticated,
    })

    const setAccentTheme = useUiSettingsStore((s) => s.setAccentTheme)
    const setRadius = useUiSettingsStore((s) => s.setRadius)
    const setNavigationPlacement = useUiSettingsStore((s) => s.setNavigationPlacement)

    // ─── 1. Mirror server settings into Zustand ───
    // The legacy panel + sync components read from this store, so writing the
    // server values here keeps them all consistent without modifying their code.
    useEffect(() => {
        if (!settings) return
        if (settings.presetAccentTheme && isPresetClass(settings.presetAccentTheme)) {
            setAccentTheme(settings.presetAccentTheme)
        }
        if (settings.radius === "none" || settings.radius === "sm" || settings.radius === "md") {
            setRadius(settings.radius)
        }
        if (settings.navigationPlacement === "sidebar" || settings.navigationPlacement === "topbar") {
            setNavigationPlacement(settings.navigationPlacement)
        }
    }, [settings, setAccentTheme, setRadius, setNavigationPlacement])

    // ─── 2. Apply custom HSL overrides as inline CSS vars on <body> ───
    // **Specificity matters here.** Theme classes in `themes.css` use selectors
    // like `.theme-zinc { --primary: ... }` (specificity 0,1,0). A `<style>` tag
    // with `body { --primary: ... }` is only (0,0,1) — class selector wins by
    // specificity regardless of source order. Inline styles on the element
    // itself have specificity (1,0,0,0) and trump everything (short of
    // `!important`), so we use `body.style.setProperty` instead of a <style>
    // injection.
    useEffect(() => {
        if (typeof document === "undefined") return
        const body = document.body
        if (!body) return

        applyOrClear(body, "--primary", settings?.customPrimary)
        applyOrClear(body, "--secondary", settings?.customSecondary)
        applyOrClear(body, "--sidebar-background", settings?.customSidebarBackground)
        applyOrClear(body, "--sidebar-foreground", settings?.customSidebarForeground)
    }, [settings])

    // ─── 3. Cleanup on logout ───
    useEffect(() => {
        if (isAuthenticated) return
        if (typeof document === "undefined") return
        const body = document.body
        if (!body) return
        body.style.removeProperty("--primary")
        body.style.removeProperty("--secondary")
        body.style.removeProperty("--sidebar-background")
        body.style.removeProperty("--sidebar-foreground")
        // Legacy <style> tag from earlier implementations — remove if present.
        document.getElementById(TENANT_OVERRIDE_STYLE_ID)?.remove()
    }, [isAuthenticated])

    return null
}

/**
 * Set or clear a CSS custom property inline on the given element.
 * Inline styles have highest specificity, so this overrides any `themes.css`
 * class-based declaration of the same property.
 */
function applyOrClear(el: HTMLElement, prop: string, value: string | null | undefined): void {
    if (value && value.trim().length > 0) {
        el.style.setProperty(prop, value)
    } else {
        el.style.removeProperty(prop)
    }
}

// Narrows a server-provided string to the strict AccentThemeClass union.
// Returns false for legacy class names (theme-zinc / theme-stone / theme-gray /
// theme-neutral) — those tenants will keep their existing class on <body> via
// AccentThemeSync, but the dropdown UI will show no selection until they pick
// a current preset, which is the desired soft-migration behaviour.
const CURRENT_PRESETS: readonly AccentThemeClass[] = [
    "theme-slate",
    "theme-blue",
    "theme-violet",
    "theme-green",
    "theme-red",
    "theme-rose",
    "theme-orange",
    "theme-yellow",
]

function isPresetClass(value: string): value is AccentThemeClass {
    return (CURRENT_PRESETS as readonly string[]).includes(value)
}
