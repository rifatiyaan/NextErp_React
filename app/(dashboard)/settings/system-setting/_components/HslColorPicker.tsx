"use client"

import { useEffect, useRef, useState } from "react"
import { HexColorPicker } from "react-colorful"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { formatHslVar, hexToHsl, hslToHex, parseHslVar } from "./hsl-utils"

/**
 * Controlled HSL color picker that round-trips the backend's `H S% L%` storage
 * format. Internally uses HEX (what react-colorful exposes); we convert at edges.
 *
 * Architecture decision — **uncontrolled internal state**:
 *
 * Earlier versions kept a `useState`+`useEffect` mirror of the parent value
 * because react-colorful needs a stable `color` string. But HSL ↔ HEX is
 * lossy (rounding clips), so the value coming back from parent could
 * round-trip to a slightly different hex than what we just emitted. Naive
 * sync caused infinite re-render under React 19's strict batching.
 *
 * The fix here: a debounced parent-emit. The picker shows the LOCAL hex
 * immediately during drag (no jitter). The HSL value is only pushed up to
 * the parent after a short idle window, breaking the tight feedback loop
 * that produced the "Maximum update depth exceeded" error. External
 * value changes (preset selection, reset, clear) replace the local hex via
 * a guarded effect that only fires when the incoming value clearly differs
 * from what we last emitted.
 */
interface HslColorPickerProps {
    label: string
    /** Backend HSL string `H S% L%` or null (= unset). */
    value: string | null
    onChange: (value: string | null) => void
    description?: string
    /** Tailwind rounded-* class to apply to swatch + input + picker frame. */
    radiusClass?: string
    className?: string
}

const COMMIT_DELAY_MS = 60

export function HslColorPicker({
    label,
    value,
    onChange,
    description,
    radiusClass = "rounded-md",
    className,
}: HslColorPickerProps) {
    const initialParsed = parseHslVar(value)
    const initialHex = initialParsed ? hslToHex(initialParsed) : "#000000"
    const [hex, setHex] = useState<string>(initialHex)

    // The HSL string we last emitted. Used by the external-sync effect to
    // ignore the parent prop coming back as our own echo.
    const lastEmittedHslRef = useRef<string | null>(null)
    const commitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Sync external changes (preset chosen, reset, clear) into local hex.
    // We compare against `lastEmittedHslRef`: if the incoming `value` is the
    // one we just sent, ignore — that's our echo, not a genuine external
    // change. If it differs (or we never emitted), update.
    useEffect(() => {
        if (lastEmittedHslRef.current !== null && lastEmittedHslRef.current === value) {
            // Echo of our own emit — clear the marker, keep local hex as-is.
            lastEmittedHslRef.current = null
            return
        }
        const parsed = parseHslVar(value)
        const incomingHex = parsed ? hslToHex(parsed) : "#000000"
        setHex((prev) => (prev === incomingHex ? prev : incomingHex))
    }, [value])

    // Cancel any pending commit when the component unmounts.
    useEffect(() => () => {
        if (commitTimerRef.current) clearTimeout(commitTimerRef.current)
    }, [])

    const handlePickerChange = (nextHex: string) => {
        setHex(nextHex)
        scheduleCommit(nextHex)
    }

    const handleHexInput = (raw: string) => {
        const normalized = normalizeHex(raw)
        setHex(normalized)
        scheduleCommit(normalized)
    }

    const scheduleCommit = (nextHex: string) => {
        if (commitTimerRef.current) clearTimeout(commitTimerRef.current)
        commitTimerRef.current = setTimeout(() => {
            const hsl = hexToHsl(nextHex)
            if (!hsl) return
            const formatted = formatHslVar(hsl)
            lastEmittedHslRef.current = formatted
            onChange(formatted)
        }, COMMIT_DELAY_MS)
    }

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">{label}</Label>
                <button
                    type="button"
                    onClick={() => {
                        if (commitTimerRef.current) clearTimeout(commitTimerRef.current)
                        lastEmittedHslRef.current = null
                        onChange(null)
                    }}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    title="Clear and use default"
                >
                    Clear
                </button>
            </div>

            {description && (
                <p className="text-[10px] text-muted-foreground">{description}</p>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className={cn("picker-shadow border border-border overflow-hidden shrink-0", radiusClass)}>
                    <HexColorPicker
                        color={hex}
                        onChange={handlePickerChange}
                        style={{ width: 220, height: 170 }}
                    />
                </div>
                <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                        <span
                            className={cn("size-8 shrink-0 border border-border", radiusClass)}
                            style={{ backgroundColor: hex }}
                            aria-hidden
                        />
                        <Input
                            value={hex}
                            onChange={(e) => handleHexInput(e.target.value)}
                            className={cn("h-8 font-mono text-xs", radiusClass)}
                            spellCheck={false}
                            aria-label={`${label} hex value`}
                        />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono break-all">
                        HSL: {value ?? "—"}
                    </p>
                </div>
            </div>
        </div>
    )
}

function normalizeHex(raw: string): string {
    const trimmed = raw.trim()
    if (!trimmed) return "#000000"
    if (trimmed.startsWith("#")) return trimmed
    return `#${trimmed}`
}
