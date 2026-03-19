const PENDING_VARIATIONS_KEY = "nexterp_pending_variations"

export interface PendingVariationOption {
    name: string
    values: string[]
}

export function getPendingVariations(): PendingVariationOption[] {
    if (typeof window === "undefined") return []
    try {
        const raw = sessionStorage.getItem(PENDING_VARIATIONS_KEY)
        if (!raw) return []
        const parsed = JSON.parse(raw) as PendingVariationOption[]
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return []
    }
}

export function setPendingVariations(options: PendingVariationOption[]): void {
    if (typeof window === "undefined") return
    sessionStorage.setItem(PENDING_VARIATIONS_KEY, JSON.stringify(options))
}

export function addPendingVariation(option: PendingVariationOption): void {
    const current = getPendingVariations()
    setPendingVariations([...current, option])
}

export function removePendingVariationAtIndex(index: number): void {
    const current = getPendingVariations()
    const next = current.filter((_, i) => i !== index)
    setPendingVariations(next)
}

export function clearPendingVariations(): void {
    if (typeof window === "undefined") return
    sessionStorage.removeItem(PENDING_VARIATIONS_KEY)
}
