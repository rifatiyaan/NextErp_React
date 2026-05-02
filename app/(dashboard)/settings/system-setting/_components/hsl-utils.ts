/**
 * HSL utilities — the backend stores colors as the CSS-var-friendly string
 * "H S% L%" (e.g. "221 83% 53%"). The picker library `react-colorful` works
 * in numeric HSL objects, and humans typically reach for HEX. These helpers
 * round-trip between the three.
 *
 * Edge cases:
 *  - Black/white round-trip cleanly.
 *  - HSL → HEX is lossy at extreme saturations (out-of-gamut clipping handled
 *    by Math.round). For UI swatch preview the loss is invisible.
 *  - Whitespace is tolerated on parse; emit is normalised to single spaces.
 */

export interface HslColor {
    h: number  // 0-360
    s: number  // 0-100
    l: number  // 0-100
}

/** Format an HSL object as the backend's `H S% L%` storage string. */
export function formatHslVar(hsl: HslColor): string {
    const h = Math.round(clamp(hsl.h, 0, 360))
    const s = Math.round(clamp(hsl.s, 0, 100))
    const l = Math.round(clamp(hsl.l, 0, 100))
    return `${h} ${s}% ${l}%`
}

/** Parse the backend `H S% L%` string back into an HSL object. */
export function parseHslVar(value: string | null | undefined): HslColor | null {
    if (!value) return null
    const match = /^\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*$/.exec(value)
    if (!match) return null
    return {
        h: clamp(parseFloat(match[1]), 0, 360),
        s: clamp(parseFloat(match[2]), 0, 100),
        l: clamp(parseFloat(match[3]), 0, 100),
    }
}

/** Convert HSL (0-360 / 0-100 / 0-100) to a 6-digit hex string `#rrggbb`. */
export function hslToHex({ h, s, l }: HslColor): string {
    const sn = clamp(s, 0, 100) / 100
    const ln = clamp(l, 0, 100) / 100
    const k = (n: number) => (n + h / 30) % 12
    const a = sn * Math.min(ln, 1 - ln)
    const f = (n: number) => {
        const v = ln - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
        return Math.round(v * 255).toString(16).padStart(2, "0")
    }
    return `#${f(0)}${f(8)}${f(4)}`
}

/** Convert a hex string (#rrggbb or #rgb) to HSL. Returns null on parse failure. */
export function hexToHsl(hex: string): HslColor | null {
    const cleaned = hex.trim().replace(/^#/, "")
    let r: number, g: number, b: number

    if (cleaned.length === 3) {
        r = parseInt(cleaned[0] + cleaned[0], 16)
        g = parseInt(cleaned[1] + cleaned[1], 16)
        b = parseInt(cleaned[2] + cleaned[2], 16)
    } else if (cleaned.length === 6) {
        r = parseInt(cleaned.slice(0, 2), 16)
        g = parseInt(cleaned.slice(2, 4), 16)
        b = parseInt(cleaned.slice(4, 6), 16)
    } else {
        return null
    }

    if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null

    const rn = r / 255
    const gn = g / 255
    const bn = b / 255
    const max = Math.max(rn, gn, bn)
    const min = Math.min(rn, gn, bn)
    const d = max - min
    const l = (max + min) / 2

    let h = 0
    let s = 0
    if (d !== 0) {
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60; break
            case gn: h = ((bn - rn) / d + 2) * 60; break
            case bn: h = ((rn - gn) / d + 4) * 60; break
        }
    }

    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}

/**
 * WCAG-ish relative luminance for HSL — approximation, good enough to flag
 * "this primary is unreadable on the default white background" without
 * pulling in chroma.js or color.js.
 */
export function relativeLuminance({ l }: HslColor): number {
    return l / 100
}

/** Returns true if a color is "very light" — useful for picking foreground swatches. */
export function isLight(hsl: HslColor): boolean {
    return relativeLuminance(hsl) > 0.6
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}
