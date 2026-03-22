import { format, parseISO } from "date-fns"

export function formatDateTime(iso: string | Date, pattern = "MMM d, yyyy"): string {
    const d = typeof iso === "string" ? parseISO(iso) : iso
    return format(d, pattern)
}

export function formatDateTimeWithTime(iso: string | Date): string {
    const d = typeof iso === "string" ? parseISO(iso) : iso
    return format(d, "MMM d, yyyy h:mm a")
}
