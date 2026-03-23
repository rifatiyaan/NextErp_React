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
