import type { UiRadius } from "@/lib/ui-settings/store"

/** Default radius for SSR / non-interactive surfaces when store is unavailable. */
export const DEFAULT_UI_RADIUS: UiRadius = "md"

/**
 * Single source of truth for corner radius classes (driven by UI settings).
 * Use {@link useRadiusClass} in client components so updates apply live.
 */
export function getRadiusClass(radius: UiRadius): string {
    switch (radius) {
        case "none":
            return "rounded-none"
        case "sm":
            return "rounded-[2px]"
        case "md":
        default:
            return "rounded-md"
    }
}

/**
 * Pushes the UI radius preset onto `document.documentElement` CSS variables so
 * Tailwind `@theme` tokens (`--radius`, `--radius-sm`, …) and any `var(--radius*)`
 * usage (emoji picker, etc.) stay in sync with settings.
 *
 * For `md`, inline overrides are removed so `:root` values from `globals.css` apply.
 */
export function applyUiRadiusToDocument(radius: UiRadius): void {
    if (typeof document === "undefined") return
    const el = document.documentElement
    el.dataset.uiRadius = radius

    const clear = () => {
        el.style.removeProperty("--radius")
        el.style.removeProperty("--radius-sm")
        el.style.removeProperty("--radius-md")
        el.style.removeProperty("--radius-lg")
    }

    switch (radius) {
        case "none":
            el.style.setProperty("--radius", "0px")
            el.style.setProperty("--radius-sm", "0px")
            el.style.setProperty("--radius-md", "0px")
            el.style.setProperty("--radius-lg", "0px")
            break
        case "sm":
            el.style.setProperty("--radius", "2px")
            el.style.setProperty("--radius-sm", "0px")
            el.style.setProperty("--radius-md", "2px")
            el.style.setProperty("--radius-lg", "2px")
            break
        case "md":
        default:
            clear()
            break
    }
}
