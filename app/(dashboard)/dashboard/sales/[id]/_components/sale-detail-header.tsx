import { formatDateTimeWithTime } from "@/lib/formatters/date"
import type { SaleDetail } from "@/lib/types/sale"

interface SaleDetailHeaderProps {
    sale: SaleDetail
}

export function SaleDetailHeader({ sale }: SaleDetailHeaderProps) {
    return (
        <div className="space-y-1 border-b pb-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h1 className="text-xl font-semibold tracking-tight">
                    Sale {sale.saleNumber}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {formatDateTimeWithTime(sale.saleDate)}
                </p>
            </div>
            <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Customer:</span>{" "}
                {sale.customerName || "—"}
            </p>
        </div>
    )
}
