import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/formatters/currency"
import { formatDateTimeWithTime } from "@/lib/formatters/date"
import { formatPaymentMethod } from "@/lib/formatters/payment-method"
import type { SalePaymentLine } from "@/lib/types/sale"

interface SalePaymentsListProps {
    payments: SalePaymentLine[]
}

export function SalePaymentsList({ payments }: SalePaymentsListProps) {
    const sorted = [...payments].sort(
        (a, b) => new Date(a.paidAt).getTime() - new Date(b.paidAt).getTime()
    )

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="h-8 text-xs">Amount</TableHead>
                        <TableHead className="h-8 text-xs">Method</TableHead>
                        <TableHead className="h-8 text-xs">Date</TableHead>
                        <TableHead className="h-8 text-xs">Reference</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sorted.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="py-6 text-center text-sm text-muted-foreground"
                            >
                                No payments recorded
                            </TableCell>
                        </TableRow>
                    ) : (
                        sorted.map((p) => (
                            <TableRow key={p.id} className="h-9">
                                <TableCell className="py-1.5 text-sm font-medium tabular-nums">
                                    {formatCurrency(p.amount)}
                                </TableCell>
                                <TableCell className="py-1.5 text-sm">
                                    {formatPaymentMethod(p.paymentMethod)}
                                </TableCell>
                                <TableCell className="py-1.5 text-sm text-muted-foreground">
                                    {formatDateTimeWithTime(p.paidAt)}
                                </TableCell>
                                <TableCell className="py-1.5 text-sm text-muted-foreground">
                                    {p.reference || "—"}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
