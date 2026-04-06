export const ACCENT_THEMES = [
    { name: "Zinc", value: "theme-zinc", swatch: "bg-zinc-950" },
    { name: "Slate", value: "theme-slate", swatch: "bg-slate-950" },
    { name: "Stone", value: "theme-stone", swatch: "bg-stone-950" },
    { name: "Gray", value: "theme-gray", swatch: "bg-gray-950" },
    { name: "Neutral", value: "theme-neutral", swatch: "bg-neutral-950" },
    { name: "Red", value: "theme-red", swatch: "bg-red-600" },
    { name: "Rose", value: "theme-rose", swatch: "bg-rose-600" },
    { name: "Orange", value: "theme-orange", swatch: "bg-orange-500" },
    { name: "Green", value: "theme-green", swatch: "bg-green-600" },
    { name: "Blue", value: "theme-blue", swatch: "bg-blue-600" },
    { name: "Yellow", value: "theme-yellow", swatch: "bg-yellow-500" },
    { name: "Violet", value: "theme-violet", swatch: "bg-violet-600" },
] as const

export type AccentThemeClass = (typeof ACCENT_THEMES)[number]["value"]

export const ACCENT_THEME_CLASSNAMES: AccentThemeClass[] = ACCENT_THEMES.map((t) => t.value)

export const DEFAULT_ACCENT_THEME: AccentThemeClass = "theme-zinc"
