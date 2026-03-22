import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "@/lib/formatters/currency"
import type { SaleItemResponse } from "@/lib/types/sale"

interface SaleLineItemsTableProps {
    items: SaleItemResponse[]
}

function variantLabel(item: SaleItemResponse): string {
    const parts = [item.variantTitle, item.variantSku].filter(Boolean)
    return parts.length ? parts.join(" · ") : "—"
}

export function SaleLineItemsTable({ items }: SaleLineItemsTableProps) {
    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="h-8 text-xs">Product</TableHead>
                        <TableHead className="h-8 text-xs">Variant</TableHead>
                        <TableHead className="h-8 text-right text-xs">Qty</TableHead>
                        <TableHead className="h-8 text-right text-xs">Price</TableHead>
                        <TableHead className="h-8 text-right text-xs">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {items.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className="py-6 text-center text-sm text-muted-foreground"
                            >
                                No line items
                            </TableCell>
                        </TableRow>
                    ) : (
                        items.map((item) => (
                            <TableRow key={item.id} className="h-9">
                                <TableCell className="py-1.5 text-sm font-medium">
                                    {item.productTitle}
                                </TableCell>
                                <TableCell className="py-1.5 text-sm text-muted-foreground">
                                    {variantLabel(item)}
                                </TableCell>
                                <TableCell className="py-1.5 text-right text-sm tabular-nums">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="py-1.5 text-right text-sm tabular-nums">
                                    {formatCurrency(item.unitPrice)}
                                </TableCell>
                                <TableCell className="py-1.5 text-right text-sm tabular-nums">
                                    {formatCurrency(item.total)}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
