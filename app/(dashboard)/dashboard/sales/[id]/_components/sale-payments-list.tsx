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
            <Table className="text-sm">
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="h-7 text-[11px]">Amount</TableHead>
                        <TableHead className="h-7 text-[11px]">Method</TableHead>
                        <TableHead className="h-7 text-[11px]">Date</TableHead>
                        <TableHead className="h-7 text-[11px]">Reference</TableHead>
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
                            <TableRow key={p.id} className="h-8">
                                <TableCell className="py-1 font-medium tabular-nums">
                                    {formatCurrency(p.amount)}
                                </TableCell>
                                <TableCell className="py-1">{formatPaymentMethod(p.paymentMethod)}</TableCell>
                                <TableCell className="py-1 text-muted-foreground">
                                    {formatDateTimeWithTime(p.paidAt)}
                                </TableCell>
                                <TableCell className="py-1 text-muted-foreground">
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
