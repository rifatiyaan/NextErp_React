export function formatQuantity(value: number, maxFractionDigits = 2): string {
    return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: maxFractionDigits,
    }).format(value)
}
