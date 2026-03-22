import type { SaleListRow } from "@/lib/types/sale"

export type SalePaymentStatusLabel = "Paid" | "Partial" | "Due"

const THRESHOLD = 0.005

export function salePaymentStatus(
    row: Pick<SaleListRow, "finalAmount" | "totalPaid" | "balanceDue">
): SalePaymentStatusLabel {
    if (row.balanceDue <= THRESHOLD) return "Paid"
    if (row.totalPaid <= THRESHOLD) return "Due"
    return "Partial"
}
