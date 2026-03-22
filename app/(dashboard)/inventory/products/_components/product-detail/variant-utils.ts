import type { ProductVariant, VariationOption } from "@/types/product"

export function sortByDisplayOrder<T extends { displayOrder?: number }>(items: T[]): T[] {
    return [...items].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
}

export function selectionFromVariant(
    variant: ProductVariant,
    options: VariationOption[]
): Record<number, number> {
    const variantValueSet = new Set(
        (variant.variationValues ?? []).map((v) => v.value.trim().toLowerCase())
    )
    const sel: Record<number, number> = {}
    const consumed = new Set<string>()

    for (const opt of sortByDisplayOrder(options)) {
        for (const val of sortByDisplayOrder(opt.values)) {
            const key = val.value.trim().toLowerCase()
            if (variantValueSet.has(key) && !consumed.has(key)) {
                sel[opt.id] = val.id
                consumed.add(key)
                break
            }
        }
    }
    return sel
}

export function findVariantForSelection(
    variants: ProductVariant[],
    options: VariationOption[],
    selection: Record<number, number>
): ProductVariant | null {
    if (!options.length || !variants.length) return null
    const sortedOpts = sortByDisplayOrder(options)

    for (const v of variants) {
        let match = true
        for (const opt of sortedOpts) {
            const valId = selection[opt.id]
            if (valId == null) {
                match = false
                break
            }
            const valStr = opt.values.find((x) => x.id === valId)?.value
            if (!valStr) {
                match = false
                break
            }
            const ok = (v.variationValues ?? []).some((x) => x.value === valStr)
            if (!ok) {
                match = false
                break
            }
        }
        if (match) return v
    }
    return null
}

export function defaultVariant(variants: ProductVariant[]): ProductVariant | null {
    if (!variants.length) return null
    return variants.find((v) => v.isActive) ?? variants[0]
}
