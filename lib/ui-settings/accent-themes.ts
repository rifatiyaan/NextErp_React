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

export const ACCENT_THEME_CLASSNAMES: string[] = [
    ...ACCENT_THEMES.map((t) => t.value),
    "theme-zinc",
    "theme-stone",
    "theme-gray",
    "theme-neutral",
]

export const DEFAULT_ACCENT_THEME: AccentThemeClass = "theme-slate"
