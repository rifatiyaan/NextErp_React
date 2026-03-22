const DEFAULT_LOCALE = "en-US"
const DEFAULT_CURRENCY = "USD"

export function formatCurrency(
    value: number,
    options?: {
        locale?: string
        currency?: string
        minimumFractionDigits?: number
        maximumFractionDigits?: number
    }
): string {
    const locale = options?.locale ?? DEFAULT_LOCALE
    const currency = options?.currency ?? DEFAULT_CURRENCY
    let minimumFractionDigits = options?.minimumFractionDigits ?? 2
    let maximumFractionDigits = options?.maximumFractionDigits ?? 2
    // Intl requires 0 ≤ min ≤ max ≤ 20; callers may pass only max (e.g. chart ticks).
    if (minimumFractionDigits > maximumFractionDigits) {
        minimumFractionDigits = maximumFractionDigits
    }
    minimumFractionDigits = Math.min(20, Math.max(0, minimumFractionDigits))
    maximumFractionDigits = Math.min(20, Math.max(0, maximumFractionDigits))
    if (minimumFractionDigits > maximumFractionDigits) {
        minimumFractionDigits = maximumFractionDigits
    }
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits,
        maximumFractionDigits,
    }).format(value)
}
