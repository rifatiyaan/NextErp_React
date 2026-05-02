/**
 * Curated preset accent themes — visually distinct, no near-duplicates.
 *
 * Previously the list had 5 grayscale variants (Zinc / Slate / Stone / Gray /
 * Neutral) which all looked identical at glance and confused users picking
 * a "neutral" option. We keep one canonical neutral (Slate — slight blue
 * tint, most common B2B default) and expose the rest of the spectrum as
 * truly distinct options. For unlimited choice, the page surfaces a custom
 * HSL picker — the preset grid is for "I want this in 2 clicks" cases.
 *
 * The 4 dropped themes (theme-zinc / theme-stone / theme-gray / theme-neutral)
 * remain defined in `app/themes.css` for backwards compatibility with any
 * tenant rows that already use them — picker just no longer shows them.
 */
export const ACCENT_THEMES = [
    // Neutral default
    { name: "Slate", value: "theme-slate", swatch: "bg-slate-700" },

    // Cool palette
    { name: "Blue", value: "theme-blue", swatch: "bg-blue-600" },
    { name: "Violet", value: "theme-violet", swatch: "bg-violet-600" },
    { name: "Green", value: "theme-green", swatch: "bg-green-600" },

    // Warm palette
    { name: "Red", value: "theme-red", swatch: "bg-red-600" },
    { name: "Rose", value: "theme-rose", swatch: "bg-rose-600" },
    { name: "Orange", value: "theme-orange", swatch: "bg-orange-500" },
    { name: "Yellow", value: "theme-yellow", swatch: "bg-yellow-500" },
] as const

export type AccentThemeClass = (typeof ACCENT_THEMES)[number]["value"]

/**
 * All possible CSS class names produced by current OR previously-supported
 * presets. Used by AccentThemeSync to remove stale classes before adding
 * the active one — must include legacy classes (zinc/stone/gray/neutral)
 * so older tenant rows still get cleaned up properly.
 */
export const ACCENT_THEME_CLASSNAMES: string[] = [
    ...ACCENT_THEMES.map((t) => t.value),
    "theme-zinc",
    "theme-stone",
    "theme-gray",
    "theme-neutral",
]

export const DEFAULT_ACCENT_THEME: AccentThemeClass = "theme-slate"
