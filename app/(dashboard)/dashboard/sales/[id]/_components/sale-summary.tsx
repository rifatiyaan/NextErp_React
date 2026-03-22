import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/formatters/currency"
import type { SaleDetail } from "@/lib/types/sale"

interface SaleSummaryProps {
    sale: SaleDetail
}

const ROWS: {
    key: keyof Pick<
        SaleDetail,
        "totalAmount" | "discount" | "tax" | "finalAmount" | "totalPaid" | "balanceDue"
    >
    label: string
    emphasize?: boolean
}[] = [
    { key: "totalAmount", label: "Subtotal" },
    { key: "discount", label: "Discount" },
    { key: "tax", label: "Tax" },
    { key: "finalAmount", label: "Final total", emphasize: true },
    { key: "totalPaid", label: "Paid" },
    { key: "balanceDue", label: "Due", emphasize: true },
]

export function SaleSummary({ sale }: SaleSummaryProps) {
    return (
        <Card>
            <CardHeader className="space-y-0 p-3 pb-2">
                <CardTitle className="text-sm font-semibold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1.5 p-3 pt-0 text-sm">
                {ROWS.map(({ key, label, emphasize }) => {
                    const value = sale[key]
                    const isDue = key === "balanceDue" && value > 0
                    return (
                        <div
                            key={key}
                            className={`flex justify-between gap-4 ${
                                emphasize ? "font-medium" : ""
                            }`}
                        >
                            <span className="text-muted-foreground">{label}</span>
                            <span
                                className={`tabular-nums ${
                                    isDue ? "font-medium text-foreground" : ""
                                }`}
                            >
                                {formatCurrency(value)}
                            </span>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}
